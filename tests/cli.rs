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
