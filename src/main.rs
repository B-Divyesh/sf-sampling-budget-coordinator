use clap::{Args, Parser, Subcommand};
use sampling_budget_coordinator::{BudgetStatus, PlanReport, PlanRequest, plan};
use std::{
    fs,
    path::{Path, PathBuf},
    process::ExitCode,
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Debug, Parser)]
#[command(name = "sbc", version, about = "Keep OpenTelemetry sampling inside one fleet-wide budget", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Audit scale scenarios and recommend safe local throughput goals.
    Plan(CommonArgs),
    /// Fail deployment when any scenario exceeds the budget plus tolerance.
    Assert(CommonArgs),
    /// Run a complete audit with bundled sample data in a temporary directory.
    Demo(DemoArgs),
}

#[derive(Debug, Args)]
struct DemoArgs {
    /// Emit the sample report as JSON. File locations are written to stderr.
    #[arg(long)]
    json: bool,
}

#[derive(Debug, Args)]
struct CommonArgs {
    /// OpenTelemetry collector YAML file to audit.
    #[arg(short, long, value_name = "FILE")]
    config: PathBuf,
    /// Fleet-wide exported span budget per second.
    #[arg(short, long, value_name = "SPANS_PER_SECOND")]
    budget: f64,
    /// Collector replicas in the deployment being checked.
    #[arg(short, long, default_value_t = 1)]
    replicas: u32,
    /// Scale scenarios, repeatable or comma-separated (for example 3,5,8).
    #[arg(long, value_delimiter = ',', value_name = "REPLICAS")]
    scenario: Vec<u32>,
    /// Incoming spans per second before trace processors.
    #[arg(short, long, value_name = "SPANS_PER_SECOND")]
    input: Option<f64>,
    /// Allowed percentage above the declared budget.
    #[arg(short, long, default_value_t = 10.0, value_name = "PERCENT")]
    tolerance: f64,
    /// Emit a stable JSON report for CI and scripts.
    #[arg(long)]
    json: bool,
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    if let Command::Demo(args) = cli.command {
        return match run_demo(&args) {
            Ok(()) => ExitCode::SUCCESS,
            Err(error) => {
                eprintln!("sbc: could not run the sample audit: {error}");
                ExitCode::from(2)
            }
        };
    }

    let (args, asserting) = match cli.command {
        Command::Plan(args) => (args, false),
        Command::Assert(args) => (args, true),
        Command::Demo(_) => unreachable!("demo handled above"),
    };
    match run(&args) {
        Ok(report) => {
            if args.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&report).expect("report is serializable")
                );
            } else {
                print_human(&report, asserting);
            }
            if asserting && report.status == BudgetStatus::OverBudget {
                ExitCode::from(3)
            } else {
                ExitCode::SUCCESS
            }
        }
        Err(error) => {
            eprintln!("sbc: {error}");
            eprintln!(
                "Try `sbc {} --help` for usage.",
                if asserting { "assert" } else { "plan" }
            );
            ExitCode::from(2)
        }
    }
}

fn run_demo(args: &DemoArgs) -> Result<(), Box<dyn std::error::Error>> {
    let unique = SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos();
    let directory = std::env::temp_dir().join(format!("sbc-demo-{}-{unique}", std::process::id()));
    fs::create_dir(&directory)?;

    let config_path = directory.join("collector.yaml");
    fs::write(&config_path, include_str!("../examples/collector.yaml"))?;
    let yaml = fs::read_to_string(&config_path)?;
    let report = plan(
        &yaml,
        &PlanRequest {
            budget: 600.0,
            replicas: 3,
            scenarios: vec![3, 5, 8],
            input_rate: Some(12_000.0),
            tolerance_percent: 10.0,
        },
    )?;
    let report_path = directory.join("report.json");
    fs::write(&report_path, serde_json::to_vec_pretty(&report)?)?;

    if args.json {
        println!("{}", serde_json::to_string_pretty(&report)?);
        eprintln!("Sample files: {}", display_path(&directory));
    } else {
        println!("DEMO — bundled sample data; your files were not read\n");
        print_human(&report, false);
        println!();
        println!("Sample files: {}", display_path(&directory));
        println!("  collector.yaml  bundled input");
        println!("  report.json     machine-readable report");
    }
    Ok(())
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().into_owned()
}

fn run(args: &CommonArgs) -> Result<PlanReport, Box<dyn std::error::Error>> {
    let yaml = fs::read_to_string(&args.config)
        .map_err(|error| format!("could not read {}: {error}", args.config.display()))?;
    let request = PlanRequest {
        budget: args.budget,
        replicas: args.replicas,
        scenarios: args.scenario.clone(),
        input_rate: args.input,
        tolerance_percent: args.tolerance,
    };
    Ok(plan(&yaml, &request)?)
}

fn print_human(report: &PlanReport, asserting: bool) {
    let headline = if report.status == BudgetStatus::WithinBudget {
        "PASS"
    } else {
        "OVER BUDGET"
    };
    println!("SAMPLING BUDGET COORDINATOR  {headline}");
    println!(
        "Budget     {:>10.2} spans/s (+{:.1}% tolerance)",
        report.budget_spans_per_second, report.tolerance_percent
    );
    println!(
        "Allowed    {:>10.2} spans/s",
        report.maximum_allowed_spans_per_second
    );
    println!();
    println!("REPLICAS   EST. EXPORT   UTILIZATION   RESULT");
    for scenario in &report.scenarios {
        let result = if scenario.status == BudgetStatus::WithinBudget {
            "within"
        } else {
            "over"
        };
        println!(
            "{:>8}   {:>11.2}   {:>10.1}%   {result}",
            scenario.replicas,
            scenario.estimated_export_spans_per_second,
            scenario.budget_utilization_percent
        );
    }
    if let Some(goal) = report.recommended_local_throughput_goal {
        println!();
        println!("RECOMMENDED LOCAL GOAL   {goal:.2} spans/s per instance");
        println!(
            "Sized for {} replicas; divide the fleet budget by the peak replica count.",
            report.maximum_scenario_replicas
        );
        for recommendation in &report.recommendations {
            println!(
                "  {} / {}: {:.2} -> {:.2}",
                recommendation.processor,
                recommendation.rule,
                recommendation.configured_goal_throughput,
                recommendation.recommended_goal_throughput
            );
        }
    }
    if !report.warnings.is_empty() {
        println!();
        println!("WARNINGS");
        for warning in &report.warnings {
            println!("  ! {warning}");
        }
    }
    println!();
    println!("ASSUMPTIONS");
    for assumption in &report.assumptions {
        println!("  - {assumption}");
    }
    if asserting && report.status == BudgetStatus::OverBudget {
        println!();
        println!("Assertion failed: at least one scale scenario exceeds the allowed volume.");
    }
}
