//! Replica-aware planning for OpenTelemetry sampling budgets.
//!
//! The library intentionally accepts collector configuration text rather than
//! trace payloads. [`plan`] is the small public surface used by the `sbc` CLI.
//!
//! ```
//! use sampling_budget_coordinator::{plan, PlanRequest};
//!
//! let config = r#"
//! processors:
//!   adaptive_tail_sampling:
//!     rules:
//!       - name: default
//!         sampler:
//!           type: adaptive_throughput
//!           goal_throughput: 100
//!           fingerprint_attributes: ['resource.attributes["service.name"]']
//! service:
//!   pipelines:
//!     traces: { processors: [adaptive_tail_sampling] }
//! "#;
//! let report = plan(config, &PlanRequest {
//!     budget: 200.0,
//!     replicas: 2,
//!     scenarios: vec![4],
//!     input_rate: Some(10_000.0),
//!     tolerance_percent: 10.0,
//! })?;
//! assert_eq!(report.recommended_local_throughput_goal, Some(50.0));
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```

use serde::Serialize;
use serde_yaml::{Mapping, Value};
use std::collections::BTreeSet;
use thiserror::Error;

/// Inputs that are independent of the collector YAML.
#[derive(Debug, Clone)]
pub struct PlanRequest {
    /// Fleet-wide exported span budget per second.
    pub budget: f64,
    /// Replica count at the deployment being evaluated.
    pub replicas: u32,
    /// Other replica counts to include in the audit.
    pub scenarios: Vec<u32>,
    /// Incoming spans per second before the trace pipeline processors.
    pub input_rate: Option<f64>,
    /// Percentage above budget permitted by a deployment assertion.
    pub tolerance_percent: f64,
}

/// A complete, serializable fleet budget report.
#[derive(Debug, Clone, Serialize)]
pub struct PlanReport {
    pub schema_version: &'static str,
    pub status: BudgetStatus,
    pub budget_spans_per_second: f64,
    pub tolerance_percent: f64,
    pub maximum_allowed_spans_per_second: f64,
    pub current_replicas: u32,
    pub maximum_scenario_replicas: u32,
    pub configured_local_throughput_goal: Option<f64>,
    pub recommended_local_throughput_goal: Option<f64>,
    pub processors: Vec<ProcessorFinding>,
    pub scenarios: Vec<ScenarioResult>,
    pub recommendations: Vec<Recommendation>,
    pub assumptions: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum BudgetStatus {
    WithinBudget,
    OverBudget,
}

#[derive(Debug, Clone, Serialize)]
pub struct ScenarioResult {
    pub replicas: u32,
    pub configured_throughput_ceiling: Option<f64>,
    pub estimated_export_spans_per_second: f64,
    pub budget_utilization_percent: f64,
    pub status: BudgetStatus,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProcessorFinding {
    pub name: String,
    pub kind: String,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Recommendation {
    pub processor: String,
    pub rule: String,
    pub configured_goal_throughput: f64,
    pub recommended_goal_throughput: f64,
}

#[derive(Debug, Error)]
pub enum CoordinatorError {
    #[error("could not parse collector YAML: {0}")]
    InvalidYaml(#[from] serde_yaml::Error),
    #[error("{0}")]
    InvalidInput(String),
    #[error("unsupported collector config: {0}")]
    Unsupported(String),
}

#[derive(Debug, Clone)]
enum Stage {
    Percentage {
        fraction: f64,
    },
    AdaptiveTail {
        processor: String,
        throughput_rules: Vec<ThroughputRule>,
        percentage_fraction: f64,
        has_percentage: bool,
        global_counters: bool,
    },
}

#[derive(Debug, Clone)]
struct ThroughputRule {
    name: String,
    goal: f64,
}

/// Parse an OpenTelemetry collector configuration and calculate its fleet-wide
/// upper estimate for each requested replica count.
pub fn plan(yaml: &str, request: &PlanRequest) -> Result<PlanReport, CoordinatorError> {
    validate_request(request)?;
    let root: Value = serde_yaml::from_str(yaml)?;
    let root = as_mapping(&root, "root")?;
    let processor_defs = map_at(root, "processors")?;
    let service = map_at(root, "service")?;
    let pipelines = map_at(service, "pipelines")?;
    let trace_pipeline = find_trace_pipeline(pipelines)?;
    let processor_names = string_list_at(trace_pipeline, "processors")?;
    if processor_names.is_empty() {
        return Err(CoordinatorError::Unsupported(
            "service.pipelines.traces has no processors to audit".into(),
        ));
    }

    let mut stages = Vec::new();
    let mut findings = Vec::new();
    let mut warnings = Vec::new();
    for name in processor_names {
        let config = processor_defs
            .get(Value::String(name.clone()))
            .ok_or_else(|| {
                CoordinatorError::InvalidInput(format!(
                    "trace pipeline references processor `{name}`, but it is not defined"
                ))
            })?;
        let config = as_mapping(config, &format!("processors.{name}"))?;
        let kind = name.split('/').next().unwrap_or(&name);
        match kind {
            "probabilistic_sampler" => {
                let percentage = required_number(config, "sampling_percentage", &name)?;
                if !(0.0..=100.0).contains(&percentage) {
                    return Err(CoordinatorError::InvalidInput(format!(
                        "{name}.sampling_percentage must be from 0 to 100"
                    )));
                }
                stages.push(Stage::Percentage {
                    fraction: percentage / 100.0,
                });
                findings.push(ProcessorFinding {
                    name,
                    kind: "probabilistic_sampler".into(),
                    summary: format!("keeps up to {percentage:.2}% of incoming span volume"),
                });
            }
            "adaptive_tail_sampling" => {
                parse_adaptive_tail(name, config, &mut stages, &mut findings, &mut warnings)?;
            }
            _ => {
                // Non-sampling processors are volume-neutral for this audit. Known
                // sampling processors are rejected so an unknown policy is not ignored.
                if kind.contains("sampling") || kind.contains("sampler") {
                    return Err(CoordinatorError::Unsupported(format!(
                        "sampling processor `{name}` is not supported by schema 0.1"
                    )));
                }
                findings.push(ProcessorFinding {
                    name,
                    kind: "volume_neutral".into(),
                    summary: "treated as volume-neutral; no sampling fields detected".into(),
                });
            }
        }
    }

    if !stages
        .iter()
        .any(|stage| matches!(stage, Stage::AdaptiveTail { .. } | Stage::Percentage { .. }))
    {
        return Err(CoordinatorError::Unsupported(
            "the traces pipeline contains no supported sampling processor".into(),
        ));
    }

    let mut replicas = BTreeSet::from([request.replicas]);
    replicas.extend(request.scenarios.iter().copied());
    if replicas.contains(&0) {
        return Err(CoordinatorError::InvalidInput(
            "replica scenarios must be at least 1".into(),
        ));
    }
    let max_replicas = *replicas
        .iter()
        .next_back()
        .expect("current replica inserted");

    let throughput_rules: Vec<_> = stages
        .iter()
        .filter_map(|stage| match stage {
            Stage::AdaptiveTail {
                processor,
                throughput_rules,
                global_counters,
                ..
            } => Some((processor, throughput_rules, *global_counters)),
            _ => None,
        })
        .flat_map(|(processor, rules, global)| {
            rules.iter().map(move |rule| (processor, rule, global))
        })
        .collect();
    let configured_local_goal = if throughput_rules.is_empty() {
        None
    } else {
        Some(checked_sum(
            throughput_rules.iter().map(|(_, rule, _)| rule.goal),
            "configured throughput goals",
        )?)
    };
    let maximum_allowed = finite_derived(
        request.budget * (1.0 + request.tolerance_percent / 100.0),
        "budget and tolerance produce a maximum allowed span rate",
    )?;
    let mut scenario_results = Vec::new();
    for &replica_count in &replicas {
        let (estimate, configured_ceiling) =
            estimate_pipeline(&stages, request.input_rate, replica_count)?;
        let utilization = finite_derived(
            estimate / request.budget * 100.0,
            "estimated export and budget produce a utilization percentage",
        )?;
        scenario_results.push(ScenarioResult {
            replicas: replica_count,
            configured_throughput_ceiling: configured_ceiling,
            estimated_export_spans_per_second: estimate,
            budget_utilization_percent: utilization,
            status: if estimate <= maximum_allowed + f64::EPSILON {
                BudgetStatus::WithinBudget
            } else {
                BudgetStatus::OverBudget
            },
        });
    }
    let status = if scenario_results
        .iter()
        .any(|s| s.status == BudgetStatus::OverBudget)
    {
        BudgetStatus::OverBudget
    } else {
        BudgetStatus::WithinBudget
    };

    let local_rules: Vec<_> = throughput_rules
        .iter()
        .filter(|(_, _, global)| !*global)
        .copied()
        .collect();
    let local_configured_total = checked_sum(
        local_rules.iter().map(|(_, rule, _)| rule.goal),
        "local throughput goals",
    )?;
    let (recommended_local_goal, recommendations) = if local_rules.is_empty() {
        (None, Vec::new())
    } else {
        match safe_local_goal(
            &stages,
            request.input_rate,
            &replicas,
            request.budget,
            local_configured_total,
        )? {
            Some(goal) if goal > 0.0 => {
                let rows = local_rules
                    .iter()
                    .map(|(processor, rule, _)| Recommendation {
                        processor: (*processor).clone(),
                        rule: rule.name.clone(),
                        configured_goal_throughput: rule.goal,
                        recommended_goal_throughput: goal * (rule.goal / local_configured_total),
                    })
                    .collect();
                (Some(goal), rows)
            }
            _ => {
                let baseline = maximum_estimate_with_local_goal(
                    &stages,
                    request.input_rate,
                    &replicas,
                    local_configured_total,
                    0.0,
                )?;
                warnings.push(format!(
                    "No positive local throughput goal can fit the declared budget: supported non-throughput rules alone estimate {baseline:.2} spans/s against {:.2} spans/s. Lower the percentage policy or increase the budget.",
                    request.budget
                ));
                (None, Vec::new())
            }
        }
    };

    let mut assumptions = vec![
        "Rates are steady-state spans per second; adjustment lag and short bursts are not simulated.".into(),
        "Incoming traffic is evenly load-balanced across collector replicas.".into(),
        "Multiple conditional throughput rules are summed as a conservative upper ceiling.".into(),
    ];
    if request.input_rate.is_none() {
        assumptions.push(
            "No input rate was provided, so the audit uses configured throughput ceilings only."
                .into(),
        );
    }

    let report = PlanReport {
        schema_version: "sbc.report/v1",
        status,
        budget_spans_per_second: request.budget,
        tolerance_percent: request.tolerance_percent,
        maximum_allowed_spans_per_second: maximum_allowed,
        current_replicas: request.replicas,
        maximum_scenario_replicas: max_replicas,
        configured_local_throughput_goal: configured_local_goal,
        recommended_local_throughput_goal: recommended_local_goal,
        processors: findings,
        scenarios: scenario_results,
        recommendations,
        assumptions,
        warnings,
    };
    validate_report_numbers(&report)?;
    Ok(report)
}

fn validate_request(request: &PlanRequest) -> Result<(), CoordinatorError> {
    if !request.budget.is_finite() || request.budget <= 0.0 {
        return Err(CoordinatorError::InvalidInput(
            "budget must be greater than 0".into(),
        ));
    }
    if request.replicas == 0 {
        return Err(CoordinatorError::InvalidInput(
            "replicas must be at least 1".into(),
        ));
    }
    if request
        .input_rate
        .is_some_and(|v| !v.is_finite() || v < 0.0)
    {
        return Err(CoordinatorError::InvalidInput(
            "input rate must be 0 or greater".into(),
        ));
    }
    if !request.tolerance_percent.is_finite() || !(0.0..=100.0).contains(&request.tolerance_percent)
    {
        return Err(CoordinatorError::InvalidInput(
            "tolerance must be from 0 to 100 percent".into(),
        ));
    }
    Ok(())
}

fn parse_adaptive_tail(
    name: String,
    config: &Mapping,
    stages: &mut Vec<Stage>,
    findings: &mut Vec<ProcessorFinding>,
    warnings: &mut Vec<String>,
) -> Result<(), CoordinatorError> {
    let rules = config
        .get(Value::String("rules".into()))
        .and_then(Value::as_sequence)
        .ok_or_else(|| {
            CoordinatorError::InvalidInput(format!("{name}.rules must be a non-empty list"))
        })?;
    if rules.is_empty() {
        return Err(CoordinatorError::InvalidInput(format!(
            "{name}.rules must not be empty"
        )));
    }
    let global_at_processor = config.contains_key(Value::String("shared_counters".into()));
    let mut throughput_rules = Vec::new();
    let mut max_fraction = 0.0_f64;
    let mut has_percentage = false;
    let mut global_counters = global_at_processor;
    for (index, rule) in rules.iter().enumerate() {
        let rule = as_mapping(rule, &format!("{name}.rules[{index}]"))?;
        let rule_name = optional_string(rule, "name").unwrap_or_else(|| format!("rule-{index}"));
        let sampler = map_at(rule, "sampler")?;
        let sampler_type = optional_string(sampler, "type").ok_or_else(|| {
            CoordinatorError::InvalidInput(format!(
                "{name}.rules[{index}].sampler.type is required"
            ))
        })?;
        match sampler_type.as_str() {
            "adaptive_throughput" => {
                let goal =
                    required_number(sampler, "goal_throughput", &format!("{name}.{rule_name}"))?;
                if goal <= 0.0 {
                    return Err(CoordinatorError::InvalidInput(format!(
                        "{name}.{rule_name}.goal_throughput must be greater than 0"
                    )));
                }
                validate_fingerprint_attributes(sampler, &name, &rule_name)?;
                global_counters |= sampler.contains_key(Value::String("shared_counters".into()));
                throughput_rules.push(ThroughputRule {
                    name: rule_name,
                    goal,
                });
            }
            "probabilistic" => {
                let pct = required_number(
                    sampler,
                    "sampling_percentage",
                    &format!("{name}.{rule_name}"),
                )?;
                validate_percentage(pct, &name, &rule_name)?;
                max_fraction = max_fraction.max(pct / 100.0);
                has_percentage = true;
            }
            "adaptive_percentage" => {
                let pct =
                    required_number(sampler, "goal_percentage", &format!("{name}.{rule_name}"))?;
                validate_percentage(pct, &name, &rule_name)?;
                validate_fingerprint_attributes(sampler, &name, &rule_name)?;
                max_fraction = max_fraction.max(pct / 100.0);
                has_percentage = true;
            }
            "always_sample" => {
                max_fraction = 1.0;
                has_percentage = true;
                if rule.contains_key(Value::String("conditions".into())) {
                    warnings.push(format!(
                        "{name}.{rule_name} always samples matching traces; without a rule traffic share, the estimate conservatively allows all input"
                    ));
                }
            }
            other => {
                return Err(CoordinatorError::Unsupported(format!(
                    "sampler type `{other}` in {name}.{rule_name} is not supported by schema 0.1"
                )));
            }
        }
    }
    if throughput_rules.is_empty() && !has_percentage {
        return Err(CoordinatorError::Unsupported(format!(
            "{name} has no supported sampler rules"
        )));
    }
    let throughput_sum = checked_sum(
        throughput_rules.iter().map(|rule| rule.goal),
        &format!("{name} throughput goals"),
    )?;
    let semantics = if global_counters {
        "fleet-wide shared"
    } else {
        "per replica"
    };
    findings.push(ProcessorFinding {
        name: name.clone(),
        kind: "adaptive_tail_sampling".into(),
        summary: if throughput_rules.is_empty() {
            format!(
                "rule upper estimate keeps {:.2}% of span volume",
                max_fraction * 100.0
            )
        } else {
            format!("{throughput_sum:.2} spans/s configured throughput ceiling ({semantics})")
        },
    });
    stages.push(Stage::AdaptiveTail {
        processor: name,
        throughput_rules,
        percentage_fraction: max_fraction,
        has_percentage,
        global_counters,
    });
    Ok(())
}

fn validate_percentage(value: f64, processor: &str, rule: &str) -> Result<(), CoordinatorError> {
    if !(0.0..=100.0).contains(&value) {
        return Err(CoordinatorError::InvalidInput(format!(
            "{processor}.{rule} percentage must be from 0 to 100"
        )));
    }
    Ok(())
}

fn validate_fingerprint_attributes(
    sampler: &Mapping,
    processor: &str,
    rule: &str,
) -> Result<(), CoordinatorError> {
    let context = format!("{processor}.{rule}.fingerprint_attributes");
    let attributes = sampler
        .get(Value::String("fingerprint_attributes".into()))
        .and_then(Value::as_sequence)
        .filter(|attributes| !attributes.is_empty())
        .ok_or_else(|| {
            CoordinatorError::InvalidInput(format!(
                "{context} must contain at least one scoped attribute selector"
            ))
        })?;

    for attribute in attributes {
        let selector = attribute.as_str().ok_or_else(|| {
            CoordinatorError::InvalidInput(format!("{context} entries must be strings"))
        })?;
        let has_valid_scope = ["resource", "scope", "span", "root", "any"]
            .iter()
            .any(|scope| {
                let prefix = format!("{scope}.attributes[\"");
                selector
                    .strip_prefix(&prefix)
                    .and_then(|rest| rest.strip_suffix("\"]"))
                    .is_some_and(|name| !name.is_empty())
            });
        if !has_valid_scope {
            return Err(CoordinatorError::InvalidInput(format!(
                "{context} entry `{selector}` must use <scope>.attributes[\"<name>\"] with scope resource, scope, span, root, or any"
            )));
        }
    }
    Ok(())
}

fn checked_sum(
    values: impl IntoIterator<Item = f64>,
    context: &str,
) -> Result<f64, CoordinatorError> {
    values
        .into_iter()
        .try_fold(0.0, |sum, value| finite_derived(sum + value, context))
}

fn finite_derived(value: f64, context: &str) -> Result<f64, CoordinatorError> {
    if value.is_finite() {
        Ok(value)
    } else {
        Err(CoordinatorError::InvalidInput(format!(
            "{context} outside the supported numeric range; use smaller numeric inputs"
        )))
    }
}

fn safe_local_goal(
    stages: &[Stage],
    input: Option<f64>,
    replicas: &BTreeSet<u32>,
    budget: f64,
    configured_local_total: f64,
) -> Result<Option<f64>, CoordinatorError> {
    let baseline =
        maximum_estimate_with_local_goal(stages, input, replicas, configured_local_total, 0.0)?;
    if baseline >= budget {
        return Ok(None);
    }

    let max_replicas = f64::from(*replicas.iter().next_back().expect("replicas are not empty"));
    let candidate = finite_derived(budget / max_replicas, "recommended local throughput goal")?;
    let candidate_estimate = maximum_estimate_with_local_goal(
        stages,
        input,
        replicas,
        configured_local_total,
        candidate,
    )?;
    if candidate_estimate <= budget {
        return Ok(Some(candidate));
    }

    let (mut low, mut high) = (0.0, candidate);
    for _ in 0..80 {
        let midpoint = low + (high - low) / 2.0;
        let estimate = maximum_estimate_with_local_goal(
            stages,
            input,
            replicas,
            configured_local_total,
            midpoint,
        )?;
        if estimate <= budget {
            low = midpoint;
        } else {
            high = midpoint;
        }
    }
    Ok((low > 0.0).then_some(low))
}

fn maximum_estimate_with_local_goal(
    stages: &[Stage],
    input: Option<f64>,
    replicas: &BTreeSet<u32>,
    configured_local_total: f64,
    replacement_local_total: f64,
) -> Result<f64, CoordinatorError> {
    replicas.iter().try_fold(0.0_f64, |maximum, &replicas| {
        let (estimate, _) = estimate_pipeline_with_local_goal(
            stages,
            input,
            replicas,
            Some((configured_local_total, replacement_local_total)),
        )?;
        Ok(maximum.max(estimate))
    })
}

fn estimate_pipeline(
    stages: &[Stage],
    input: Option<f64>,
    replicas: u32,
) -> Result<(f64, Option<f64>), CoordinatorError> {
    estimate_pipeline_with_local_goal(stages, input, replicas, None)
}

fn estimate_pipeline_with_local_goal(
    stages: &[Stage],
    input: Option<f64>,
    replicas: u32,
    local_goal: Option<(f64, f64)>,
) -> Result<(f64, Option<f64>), CoordinatorError> {
    let mut rate = input;
    let mut latest_ceiling = None;
    for stage in stages {
        match stage {
            Stage::Percentage { fraction } => {
                rate = rate.map(|r| r * fraction);
            }
            Stage::AdaptiveTail {
                throughput_rules,
                percentage_fraction,
                has_percentage,
                global_counters,
                ..
            } => {
                let stage_total = checked_sum(
                    throughput_rules.iter().map(|rule| {
                        if *global_counters {
                            rule.goal
                        } else if let Some((configured_total, replacement_total)) = local_goal {
                            replacement_total * (rule.goal / configured_total)
                        } else {
                            rule.goal
                        }
                    }),
                    "throughput ceiling",
                )?;
                let ceiling = finite_derived(
                    stage_total
                        * if *global_counters {
                            1.0
                        } else {
                            f64::from(replicas)
                        },
                    "throughput ceiling",
                )?;
                if !throughput_rules.is_empty() {
                    latest_ceiling = Some(ceiling);
                }
                rate = match (rate, throughput_rules.is_empty(), *has_percentage) {
                    (Some(incoming), false, true) => {
                        let percentage_volume = finite_derived(
                            incoming * percentage_fraction,
                            "percentage-policy estimate",
                        )?;
                        Some(incoming.min(finite_derived(
                            ceiling + percentage_volume,
                            "mixed-policy estimate",
                        )?))
                    }
                    (Some(incoming), false, false) => Some(incoming.min(ceiling)),
                    (Some(incoming), true, true) => Some(finite_derived(
                        incoming * percentage_fraction,
                        "percentage-policy estimate",
                    )?),
                    (Some(incoming), true, false) => Some(incoming),
                    (None, false, false) => Some(ceiling),
                    (None, _, true) => None,
                    (None, true, false) => None,
                };
            }
        }
    }
    rate.map(|value| (value, latest_ceiling)).ok_or_else(|| {
        CoordinatorError::InvalidInput(
            "an input rate is required to estimate percentage or always-sample policies".into(),
        )
    })
}

fn validate_report_numbers(report: &PlanReport) -> Result<(), CoordinatorError> {
    let mut values = vec![
        report.budget_spans_per_second,
        report.tolerance_percent,
        report.maximum_allowed_spans_per_second,
    ];
    values.extend(report.configured_local_throughput_goal);
    values.extend(report.recommended_local_throughput_goal);
    for scenario in &report.scenarios {
        values.extend(scenario.configured_throughput_ceiling);
        values.push(scenario.estimated_export_spans_per_second);
        values.push(scenario.budget_utilization_percent);
    }
    for recommendation in &report.recommendations {
        values.push(recommendation.configured_goal_throughput);
        values.push(recommendation.recommended_goal_throughput);
    }
    if values.into_iter().all(f64::is_finite) {
        Ok(())
    } else {
        Err(CoordinatorError::InvalidInput(
            "derived report values exceed the supported numeric range; use smaller numeric inputs"
                .into(),
        ))
    }
}

fn find_trace_pipeline(pipelines: &Mapping) -> Result<&Mapping, CoordinatorError> {
    if let Some(value) = pipelines.get(Value::String("traces".into())) {
        return as_mapping(value, "service.pipelines.traces");
    }
    let matches: Vec<_> = pipelines
        .iter()
        .filter_map(|(key, value)| {
            key.as_str()
                .filter(|key| key.starts_with("traces/"))
                .map(|key| (key, value))
        })
        .collect();
    match matches.as_slice() {
        [] => Err(CoordinatorError::Unsupported(
            "service.pipelines has no traces pipeline".into(),
        )),
        [(_, value)] => as_mapping(value, "service.pipelines.traces/*"),
        _ => Err(CoordinatorError::Unsupported(
            "multiple traces pipelines require separate audits in schema 0.1".into(),
        )),
    }
}

fn as_mapping<'a>(value: &'a Value, context: &str) -> Result<&'a Mapping, CoordinatorError> {
    value
        .as_mapping()
        .ok_or_else(|| CoordinatorError::InvalidInput(format!("{context} must be a map")))
}

fn map_at<'a>(map: &'a Mapping, key: &str) -> Result<&'a Mapping, CoordinatorError> {
    map.get(Value::String(key.into()))
        .ok_or_else(|| CoordinatorError::InvalidInput(format!("{key} is required")))
        .and_then(|value| as_mapping(value, key))
}

fn string_list_at(map: &Mapping, key: &str) -> Result<Vec<String>, CoordinatorError> {
    map.get(Value::String(key.into()))
        .and_then(Value::as_sequence)
        .ok_or_else(|| CoordinatorError::InvalidInput(format!("{key} must be a list")))?
        .iter()
        .map(|value| {
            value.as_str().map(str::to_owned).ok_or_else(|| {
                CoordinatorError::InvalidInput(format!("{key} entries must be strings"))
            })
        })
        .collect()
}

fn optional_string(map: &Mapping, key: &str) -> Option<String> {
    map.get(Value::String(key.into()))
        .and_then(Value::as_str)
        .map(str::to_owned)
}

fn required_number(map: &Mapping, key: &str, context: &str) -> Result<f64, CoordinatorError> {
    map.get(Value::String(key.into()))
        .and_then(Value::as_f64)
        .filter(|v| v.is_finite())
        .ok_or_else(|| CoordinatorError::InvalidInput(format!("{context}.{key} must be a number")))
}

#[cfg(test)]
mod tests {
    use super::*;

    const CONFIG: &str = r#"
processors:
  adaptive_tail_sampling:
    rules:
      - name: default
        sampler:
          type: adaptive_throughput
          goal_throughput: 600
          fingerprint_attributes: ['resource.attributes["service.name"]']
service:
  pipelines:
    traces:
      processors: [adaptive_tail_sampling]
"#;

    fn request() -> PlanRequest {
        PlanRequest {
            budget: 600.0,
            replicas: 3,
            scenarios: vec![5, 8],
            input_rate: Some(12_000.0),
            tolerance_percent: 10.0,
        }
    }

    #[test]
    fn documents_replica_multiplied_throughput_and_safe_goal() {
        let report = plan(CONFIG, &request()).unwrap();
        assert_eq!(report.status, BudgetStatus::OverBudget);
        assert_eq!(
            report.scenarios[0].estimated_export_spans_per_second,
            1_800.0
        );
        assert_eq!(
            report.scenarios[2].estimated_export_spans_per_second,
            4_800.0
        );
        assert_eq!(report.recommended_local_throughput_goal, Some(75.0));
    }

    #[test]
    fn probabilistic_volume_does_not_multiply_with_replicas() {
        let config = CONFIG.replace(
            "adaptive_tail_sampling:\n    rules:\n      - name: default\n        sampler:\n          type: adaptive_throughput\n          goal_throughput: 600\n          fingerprint_attributes: ['resource.attributes[\"service.name\"]']",
            "probabilistic_sampler:\n    sampling_percentage: 5",
        ).replace("adaptive_tail_sampling]", "probabilistic_sampler]");
        let mut req = request();
        req.budget = 700.0;
        let report = plan(&config, &req).unwrap();
        assert!(
            report
                .scenarios
                .iter()
                .all(|s| s.estimated_export_spans_per_second == 600.0)
        );
        assert_eq!(report.status, BudgetStatus::WithinBudget);
    }

    #[test]
    fn no_input_is_enough_for_throughput_only_audit() {
        let mut req = request();
        req.input_rate = None;
        let report = plan(CONFIG, &req).unwrap();
        assert_eq!(
            report.scenarios[1].configured_throughput_ceiling,
            Some(3_000.0)
        );
    }

    #[test]
    fn percentage_policy_requires_input() {
        let config = CONFIG.replace(
            "adaptive_throughput\n          goal_throughput: 600\n          fingerprint_attributes: ['resource.attributes[\"service.name\"]']",
            "probabilistic\n          sampling_percentage: 10",
        );
        let mut req = request();
        req.input_rate = None;
        assert!(
            plan(&config, &req)
                .unwrap_err()
                .to_string()
                .contains("input rate")
        );
    }

    #[test]
    fn unsupported_sampling_processor_is_not_ignored() {
        let config = CONFIG.replace("adaptive_tail_sampling", "tail_sampling");
        assert!(
            plan(&config, &request())
                .unwrap_err()
                .to_string()
                .contains("not supported")
        );
    }

    #[test]
    fn recommended_goal_holds_across_one_hundred_scale_intervals() {
        let report = plan(CONFIG, &request()).unwrap();
        let goal = report.recommended_local_throughput_goal.unwrap();
        let within_tolerance = (0..100)
            .filter(|interval| {
                let replicas = 1 + interval % report.maximum_scenario_replicas;
                let incoming = 400.0 + f64::from(*interval) * 173.0;
                let exported = incoming.min(goal * f64::from(replicas));
                exported <= report.maximum_allowed_spans_per_second
            })
            .count();
        assert!(
            within_tolerance >= 90,
            "{within_tolerance} intervals were safe"
        );
    }

    #[test]
    fn mixed_policy_goal_reserves_percentage_volume() {
        let config = r#"
processors:
  adaptive_tail_sampling:
    rules:
      - name: selected-traffic
        conditions: [tenant-is-selected]
        sampler: { type: probabilistic, sampling_percentage: 2 }
      - name: default
        sampler:
          type: adaptive_throughput
          goal_throughput: 75
          fingerprint_attributes: ['resource.attributes["service.name"]']
service:
  pipelines:
    traces: { processors: [adaptive_tail_sampling] }
"#;
        let mut req = request();
        req.replicas = 8;
        req.scenarios = vec![3, 5, 8];
        let report = plan(config, &req).unwrap();
        let goal = report.recommended_local_throughput_goal.unwrap();
        assert!((goal - 45.0).abs() < 1e-9);

        let recommended =
            config.replace("goal_throughput: 75", &format!("goal_throughput: {goal}"));
        let applied = plan(&recommended, &req).unwrap();
        assert!(applied.scenarios.iter().all(|scenario| {
            scenario.estimated_export_spans_per_second <= applied.maximum_allowed_spans_per_second
        }));
    }

    #[test]
    fn mixed_policy_omits_goal_when_percentage_volume_exceeds_budget() {
        let config = r#"
processors:
  adaptive_tail_sampling:
    rules:
      - name: selected-traffic
        conditions: [tenant-is-selected]
        sampler: { type: probabilistic, sampling_percentage: 10 }
      - name: default
        sampler:
          type: adaptive_throughput
          goal_throughput: 75
          fingerprint_attributes: ['resource.attributes["service.name"]']
service:
  pipelines:
    traces: { processors: [adaptive_tail_sampling] }
"#;
        let mut req = request();
        req.replicas = 8;
        req.scenarios.clear();
        let report = plan(config, &req).unwrap();
        assert_eq!(
            report.scenarios[0].estimated_export_spans_per_second,
            1_800.0
        );
        assert_eq!(report.maximum_allowed_spans_per_second, 660.0);
        assert_eq!(report.recommended_local_throughput_goal, None);
        assert!(report.recommendations.is_empty());
        assert!(
            report
                .warnings
                .join(" ")
                .contains("No positive local throughput goal")
        );
    }

    #[test]
    fn adaptive_samplers_require_scoped_fingerprint_attributes() {
        for sampler in [
            "type: adaptive_throughput\n          goal_throughput: 100",
            "type: adaptive_throughput\n          goal_throughput: 100\n          fingerprint_attributes: []",
            "type: adaptive_percentage\n          goal_percentage: 10",
            "type: adaptive_percentage\n          goal_percentage: 10\n          fingerprint_attributes: [service.name]",
        ] {
            let config = format!(
                "processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: default\n        sampler:\n          {sampler}\nservice:\n  pipelines:\n    traces: {{ processors: [adaptive_tail_sampling] }}\n"
            );
            let error = plan(&config, &request()).unwrap_err().to_string();
            assert!(error.contains("fingerprint_attributes"), "{error}");
        }
    }

    #[test]
    fn rejects_finite_inputs_when_derived_values_are_not_finite() {
        let mut req = request();
        req.budget = 1e308;
        req.replicas = 1;
        req.scenarios.clear();
        req.tolerance_percent = 100.0;
        assert!(
            plan(CONFIG, &req)
                .unwrap_err()
                .to_string()
                .contains("supported numeric range")
        );

        req.budget = f64::MIN_POSITIVE;
        req.tolerance_percent = 0.0;
        assert!(
            plan(CONFIG, &req)
                .unwrap_err()
                .to_string()
                .contains("supported numeric range")
        );
    }
}
