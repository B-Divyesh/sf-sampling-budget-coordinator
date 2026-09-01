use assert_cmd::Command;
use predicates::prelude::*;
use std::fs;
use tempfile::tempdir;

const CONFIG: &str = r#"
processors:
  adaptive_tail_sampling:
    rules:
      - name: default
        sampler:
          type: adaptive_throughput
          goal_throughput: 100
          fingerprint_attributes: ['resource.attributes["service.name"]']
service:
  pipelines:
    traces:
      processors: [adaptive_tail_sampling]
"#;

fn fixture() -> (tempfile::TempDir, std::path::PathBuf) {
    let directory = tempdir().unwrap();
    let path = directory.path().join("collector.yaml");
    fs::write(&path, CONFIG).unwrap();
    (directory, path)
}

#[test]
fn readme_plan_example_reports_recommendation() {
    let (_directory, path) = fixture();
    Command::cargo_bin("sbc")
        .unwrap()
        .args(["plan", "--config"])
        .arg(path)
        .args([
            "--budget",
            "100",
            "--replicas",
            "3",
            "--scenario",
            "3,5,8",
            "--input",
            "12000",
        ])
        .assert()
        .success()
        .stdout(predicate::str::contains("RECOMMENDED LOCAL GOAL   12.50"));
}

#[test]
fn assertion_uses_exit_code_three_and_valid_json() {
    let (_directory, path) = fixture();
    let output = Command::cargo_bin("sbc")
        .unwrap()
        .args(["assert", "--config"])
        .arg(path)
        .args([
            "--budget",
            "100",
            "--replicas",
            "3",
            "--input",
            "12000",
            "--json",
        ])
        .assert()
        .code(3)
        .get_output()
        .stdout
        .clone();
    let json: serde_json::Value = serde_json::from_slice(&output).unwrap();
    assert_eq!(json["status"], "over_budget");
}

#[test]
fn missing_file_is_actionable_and_uses_exit_code_two() {
    Command::cargo_bin("sbc")
        .unwrap()
        .args(["plan", "--config", "does-not-exist.yaml", "--budget", "100"])
        .assert()
        .code(2)
        .stderr(predicate::str::contains("could not read"));
}

#[test]
fn demo_runs_bundled_sample_in_a_temp_directory() {
    let output = Command::cargo_bin("sbc")
        .unwrap()
        .args(["demo", "--json"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Sample files:"))
        .get_output()
        .clone();

    let report: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(report["schema_version"], "sbc.report/v1");
    assert_eq!(report["maximum_scenario_replicas"], 8);
    assert_eq!(report["recommended_local_throughput_goal"], 75.0);

    let stderr = String::from_utf8(output.stderr).unwrap();
    let directory = stderr.trim().strip_prefix("Sample files: ").unwrap();
    assert!(
        std::path::Path::new(directory)
            .join("collector.yaml")
            .is_file()
    );
    assert!(
        std::path::Path::new(directory)
            .join("report.json")
            .is_file()
    );
    fs::remove_dir_all(directory).unwrap();
}

#[test]
fn privacy_documentation_scopes_yaml_handling_to_local_process_memory() {
    let readme = include_str!("../README.md");
    let landing = include_str!("../site/index.html");
    let privacy = include_str!("../site/privacy/index.html");
    assert!(readme.contains("does not transmit, persist, or log configuration contents"));
    assert!(
        readme
            .contains("configuration can contain endpoints, headers, identifiers, or credentials")
    );
    assert!(privacy.contains("can contain endpoints, headers, identifiers, or credentials"));
    for public_copy in [readme, landing, privacy] {
        assert!(
            !public_copy.contains(
                "never reads traces, span attributes, credentials, or customer identifiers"
            )
        );
        assert!(!public_copy.contains("reads only referenced processors"));
    }
}

#[test]
fn exact_mixed_policy_failure_never_returns_an_unsafe_recommendation() {
    let directory = tempdir().unwrap();
    let path = directory.path().join("mixed.yaml");
    fs::write(
        &path,
        r#"
processors:
  adaptive_tail_sampling:
    rules:
      - name: conditional-ten-percent
        conditions: [tenant-is-trial]
        sampler: { type: probabilistic, sampling_percentage: 10 }
      - name: default
        sampler:
          type: adaptive_throughput
          goal_throughput: 75
          fingerprint_attributes: ['resource.attributes["service.name"]']
service:
  pipelines:
    traces: { processors: [adaptive_tail_sampling] }
"#,
    )
    .unwrap();

    let output = Command::cargo_bin("sbc")
        .unwrap()
        .args(["plan", "--config"])
        .arg(path)
        .args([
            "--budget",
            "600",
            "--replicas",
            "8",
            "--input",
            "12000",
            "--tolerance",
            "10",
            "--json",
        ])
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let report: serde_json::Value = serde_json::from_slice(&output).unwrap();
    assert_eq!(
        report["scenarios"][0]["estimated_export_spans_per_second"],
        1800.0
    );
    assert_eq!(report["maximum_allowed_spans_per_second"], 660.0);
    assert!(report["recommended_local_throughput_goal"].is_null());
    assert!(report["recommendations"].as_array().unwrap().is_empty());
    assert!(
        report["warnings"][0]
            .as_str()
            .unwrap()
            .contains("No positive local throughput goal")
    );
}

#[test]
fn missing_adaptive_fingerprint_is_invalid_input() {
    let directory = tempdir().unwrap();
    let path = directory.path().join("missing-fingerprint.yaml");
    fs::write(
        &path,
        CONFIG.replace(
            "          fingerprint_attributes: ['resource.attributes[\"service.name\"]']\n",
            "",
        ),
    )
    .unwrap();
    Command::cargo_bin("sbc")
        .unwrap()
        .args(["plan", "--config"])
        .arg(path)
        .args(["--budget", "100"])
        .assert()
        .code(2)
        .stderr(predicate::str::contains("fingerprint_attributes"));
}

#[test]
fn overflowing_derived_report_values_are_invalid_input() {
    let (_directory, path) = fixture();
    Command::cargo_bin("sbc")
        .unwrap()
        .args(["plan", "--config"])
        .arg(path)
        .args([
            "--budget",
            "1e308",
            "--replicas",
            "1",
            "--input",
            "12000",
            "--tolerance",
            "100",
            "--json",
        ])
        .assert()
        .code(2)
        .stdout(predicate::str::is_empty())
        .stderr(predicate::str::contains("supported numeric range"));
}
