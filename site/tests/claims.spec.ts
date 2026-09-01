import { expect, test } from "@playwright/test";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const binary = join(process.cwd(), "target", "debug", process.platform === "win32" ? "sbc.exe" : "sbc");
const example = join(process.cwd(), "examples", "collector.yaml");

function run(args: string[], cwd = process.cwd()) {
  return spawnSync(binary, args, { cwd, encoding: "utf8" });
}

function temporaryConfig(yaml: string): { directory: string; config: string } {
  const directory = mkdtempSync(join(tmpdir(), "sbc-claim-"));
  const config = join(directory, "collector.yaml");
  writeFileSync(config, yaml);
  return { directory, config };
}

function jsonReport(args: string[]) {
  const output = run([...args, "--json"]);
  return { output, report: output.stdout ? JSON.parse(output.stdout) : null };
}

test("@claim:demo-sandbox bundled demos stay isolated", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI and storage isolation need one browser engine");
  await page.goto("/demo/");
  await page.getByLabel(/Configured local goal/).fill("42");
  await page.getByRole("button", { name: "Recalculate budget" }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByLabel(/Configured local goal/)).toHaveValue("600");
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });

  const output = run(["demo", "--json"]);
  expect(output.status).toBe(0);
  expect(() => JSON.parse(output.stdout)).not.toThrow();
  const directory = output.stderr.trim().replace("Sample files: ", "");
  expect(directory).toContain("sbc-demo-");
  expect(readdirSync(directory).sort()).toEqual(["collector.yaml", "report.json"]);
  rmSync(directory, { recursive: true });
});

test("@claim:local-privacy planner and CLI keep input local", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "privacy path is covered once in Chromium");
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo/");
  await page.getByLabel(/Configured local goal/).fill("60");
  await page.getByRole("button", { name: "Recalculate budget" }).click();
  expect(new Set(requests.map((url) => new URL(url).origin))).toEqual(new Set(["http://127.0.0.1:4173"]));
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: "" });
  await expect(page.locator('input[type="email"], input[type="password"], form[action]')).toHaveCount(0);

  const directory = mkdtempSync(join(tmpdir(), "sbc-private-"));
  const config = join(directory, "collector.yaml");
  const sentinel = "DO_NOT_PRINT_THIS_SECRET";
  writeFileSync(config, `processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: default\n        sampler: { type: adaptive_throughput, goal_throughput: 60, fingerprint_attributes: ['resource.attributes["service.name"]'] }\nexporters:\n  otlp:\n    headers: { authorization: ${sentinel} }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling], exporters: [otlp] }\n`);
  const output = run(["plan", "--config", config, "--budget", "600", "--replicas", "8", "--input", "12000"], directory);
  expect(output.status).toBe(0);
  expect(`${output.stdout}${output.stderr}`).not.toContain(sentinel);
  expect(readdirSync(directory)).toEqual(["collector.yaml"]);
  const source = `${readFileSync(join(process.cwd(), "src", "main.rs"), "utf8")}\n${readFileSync(join(process.cwd(), "Cargo.toml"), "utf8")}`;
  expect(source).not.toMatch(/TcpStream|UdpSocket|reqwest|hyper|ureq/i);
  rmSync(directory, { recursive: true });
});

test("@claim:offline-reload demo reloads and calculates offline", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "service-worker lifecycle is covered once in Chromium");
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/demo/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.dataset.appReady === "true");
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.appReady === "true");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Test a sample collector fleet");
  await page.getByLabel(/Configured local goal/).fill("60");
  await page.getByRole("button", { name: "Recalculate budget" }).click();
  await expect(page.getByText("Within budget", { exact: true })).toBeVisible();
  await context.close();
});

test("@claim:sample-budget browser and CLI return the declared sample result", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI comparison is covered once in Chromium");
  await page.goto("/demo/");
  await expect(page.locator("#ledger-body tr")).toHaveText(["31,8001,800Over", "84,8004,800Over"]);
  await expect(page.locator("#recommended-goal")).toHaveText("75");
  const output = run(["demo", "--json"]);
  expect(output.status).toBe(0);
  const report = JSON.parse(output.stdout);
  expect(report.scenarios.map((row: { estimated_export_spans_per_second: number }) => row.estimated_export_spans_per_second)).toEqual([1800, 3000, 4800]);
  expect(report.recommended_local_throughput_goal).toBe(75);
  rmSync(output.stderr.trim().replace("Sample files: ", ""), { recursive: true });
});

test("@claim:deploy-assertion returns stable machine-readable exit codes", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const within = run(["assert", "--config", example, "--budget", "4800", "--replicas", "8", "--input", "12000", "--tolerance", "0", "--json"]);
  expect(within.status).toBe(0);
  expect(JSON.parse(within.stdout).status).toBe("within_budget");
  const invalid = run(["assert", "--config", example, "--budget", "0"]);
  expect(invalid.status).toBe(2);
  const over = run(["assert", "--config", example, "--budget", "600", "--replicas", "8", "--input", "12000", "--json"]);
  expect(over.status).toBe(3);
  expect(JSON.parse(over.stdout).status).toBe("over_budget");
  const plan = run(["plan", "--config", example, "--budget", "600", "--replicas", "3", "--json"]);
  expect(plan.status).toBe(0);
  expect(JSON.parse(plan.stdout).schema_version).toBe("sbc.report/v1");
});

test("@claim:supported-sampler-models calculates every documented sampler type", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const cases = [
    {
      yaml: "processors:\n  adaptive_tail_sampling:\n    rules:\n      - sampler: { type: adaptive_throughput, goal_throughput: 100, fingerprint_attributes: ['resource.attributes[\"service.name\"]'] }\n      - sampler: { type: adaptive_throughput, goal_throughput: 50, fingerprint_attributes: ['span.attributes[\"http.route\"]'] }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n",
      expected: 300
    },
    {
      yaml: "processors:\n  adaptive_tail_sampling:\n    rules:\n      - sampler: { type: adaptive_percentage, goal_percentage: 10, fingerprint_attributes: ['resource.attributes[\"service.name\"]'] }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n",
      expected: 100
    },
    {
      yaml: "processors:\n  adaptive_tail_sampling:\n    rules:\n      - sampler: { type: probabilistic, sampling_percentage: 20 }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n",
      expected: 200
    },
    {
      yaml: "processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: errors\n        conditions: [span.status.code == STATUS_CODE_ERROR]\n        sampler: { type: always_sample }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n",
      expected: 1000,
      warning: true
    },
    {
      yaml: "processors:\n  probabilistic_sampler:\n    sampling_percentage: 5\nservice:\n  pipelines:\n    traces: { processors: [probabilistic_sampler] }\n",
      expected: 50
    }
  ];
  for (const item of cases) {
    const { directory, config } = temporaryConfig(item.yaml);
    const { output, report } = jsonReport(["plan", "--config", config, "--budget", "2000", "--replicas", "2", "--input", "1000"]);
    expect(output.status).toBe(0);
    expect(report.scenarios).toHaveLength(1);
    expect(report.scenarios[0].estimated_export_spans_per_second).toBe(item.expected);
    if (item.warning) expect(report.warnings.join(" ")).toContain("without a rule traffic share");
    rmSync(directory, { recursive: true });
  }
  for (const sampler of [
    "{ type: adaptive_throughput, goal_throughput: 100 }",
    "{ type: adaptive_percentage, goal_percentage: 10 }"
  ]) {
    const { directory, config } = temporaryConfig(`processors:\n  adaptive_tail_sampling:\n    rules:\n      - sampler: ${sampler}\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n`);
    const output = run(["plan", "--config", config, "--budget", "2000", "--input", "1000"]);
    expect(output.status).toBe(2);
    expect(output.stderr).toContain("fingerprint_attributes");
    rmSync(directory, { recursive: true });
  }
});

test("@claim:configuration-errors rejects missing trace-pipeline wiring", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const { directory, config } = temporaryConfig("processors:\n  adaptive_tail_sampling:\n    rules:\n      - sampler: { type: adaptive_throughput, goal_throughput: 100, fingerprint_attributes: ['resource.attributes[\"service.name\"]'] }\nservice:\n  pipelines:\n    metrics: { processors: [adaptive_tail_sampling] }\n");
  const output = run(["plan", "--config", config, "--budget", "600"]);
  expect(output.status).toBe(2);
  expect(output.stderr).toContain("no traces pipeline");
  rmSync(directory, { recursive: true });
});

test("@claim:scenario-assertion checks repeated and comma-separated scenarios", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  for (const scenarios of [["--scenario", "1", "--scenario", "2"], ["--scenario", "1,2"]]) {
    const { output, report } = jsonReport(["assert", "--config", example, "--budget", "1000", "--replicas", "1", "--input", "12000", ...scenarios]);
    expect(output.status).toBe(3);
    expect(report.maximum_allowed_spans_per_second).toBe(1100);
    expect(report.scenarios.map((row: { replicas: number }) => row.replicas)).toEqual([1, 2]);
    expect(report.scenarios.map((row: { status: string }) => row.status)).toEqual(["within_budget", "over_budget"]);
  }
});

test("@claim:assumption-reporting emits assumptions and conditional warnings", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const { directory, config } = temporaryConfig("processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: errors\n        conditions: [span.status.code == STATUS_CODE_ERROR]\n        sampler: { type: always_sample }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n");
  const human = run(["plan", "--config", config, "--budget", "1200", "--input", "1000"]);
  expect(human.status).toBe(0);
  expect(human.stdout).toContain("ASSUMPTIONS");
  expect(human.stdout).toContain("steady-state");
  expect(human.stdout).toContain("evenly load-balanced");
  expect(human.stdout).toContain("conditional throughput rules");
  expect(human.stdout).toContain("WARNINGS");
  const { output, report } = jsonReport(["plan", "--config", config, "--budget", "1200", "--input", "1000"]);
  expect(output.status).toBe(0);
  expect(report.assumptions.join(" ")).toContain("steady-state");
  expect(report.assumptions.join(" ")).toContain("evenly load-balanced");
  expect(report.assumptions.join(" ")).toContain("conditional throughput rules");
  expect(report.warnings.join(" ")).toContain("without a rule traffic share");
  rmSync(directory, { recursive: true });
});

test("@claim:default-tolerance defaults to ten percent and supports an override", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const defaultReport = jsonReport(["assert", "--config", example, "--budget", "600", "--replicas", "1", "--input", "12000"]);
  expect(defaultReport.output.status).toBe(0);
  expect(defaultReport.report.tolerance_percent).toBe(10);
  expect(defaultReport.report.maximum_allowed_spans_per_second).toBe(660);
  const overridden = jsonReport(["assert", "--config", example, "--budget", "600", "--replicas", "1", "--input", "12000", "--tolerance", "5"]);
  expect(overridden.output.status).toBe(0);
  expect(overridden.report.tolerance_percent).toBe(5);
  expect(overridden.report.maximum_allowed_spans_per_second).toBe(630);
});

test("@claim:upper-bound-without-input reports configured ceilings", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const { output, report } = jsonReport(["plan", "--config", example, "--budget", "6000", "--replicas", "3", "--scenario", "5"]);
  expect(output.status).toBe(0);
  expect(report.scenarios.map((row: { configured_throughput_ceiling: number }) => row.configured_throughput_ceiling)).toEqual([1800, 3000]);
  expect(report.scenarios.map((row: { estimated_export_spans_per_second: number }) => row.estimated_export_spans_per_second)).toEqual([1800, 3000]);
  expect(report.assumptions.join(" ")).toContain("No input rate was provided");
});

test("@claim:plan-report includes scenario ceilings, exports, and proportional recommendations", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const first = temporaryConfig("processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: first\n        sampler: { type: adaptive_throughput, goal_throughput: 100, fingerprint_attributes: ['resource.attributes[\"service.name\"]'] }\n      - name: second\n        sampler: { type: adaptive_throughput, goal_throughput: 50, fingerprint_attributes: ['span.attributes[\"http.route\"]'] }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n");
  const firstResult = jsonReport(["plan", "--config", first.config, "--budget", "500", "--replicas", "2", "--scenario", "3", "--input", "12000"]);
  expect(firstResult.output.status).toBe(0);
  expect(firstResult.report.scenarios.map((row: { configured_throughput_ceiling: number }) => row.configured_throughput_ceiling)).toEqual([300, 450]);
  expect(firstResult.report.scenarios.map((row: { estimated_export_spans_per_second: number }) => row.estimated_export_spans_per_second)).toEqual([300, 450]);
  const firstRecommendations = firstResult.report.recommendations.map((row: { recommended_goal_throughput: number }) => row.recommended_goal_throughput);
  expect(firstRecommendations[0]).toBeCloseTo(111.11111111111111);
  expect(firstRecommendations[1]).toBeCloseTo(55.55555555555556);
  rmSync(first.directory, { recursive: true });

  const second = temporaryConfig("processors:\n  adaptive_tail_sampling:\n    rules:\n      - sampler: { type: adaptive_throughput, goal_throughput: 50, fingerprint_attributes: ['resource.attributes[\"service.name\"]'] }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n");
  const secondResult = jsonReport(["plan", "--config", second.config, "--budget", "500", "--replicas", "1", "--scenario", "4", "--input", "12000"]);
  expect(secondResult.output.status).toBe(0);
  expect(secondResult.report.scenarios.map((row: { configured_throughput_ceiling: number }) => row.configured_throughput_ceiling)).toEqual([50, 200]);
  expect(secondResult.report.scenarios.map((row: { estimated_export_spans_per_second: number }) => row.estimated_export_spans_per_second)).toEqual([50, 200]);
  expect(secondResult.report.recommendations[0].recommended_goal_throughput).toBe(125);
  rmSync(second.directory, { recursive: true });

  const mixed = temporaryConfig("processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: selected-traffic\n        conditions: [tenant-is-selected]\n        sampler: { type: probabilistic, sampling_percentage: 2 }\n      - name: default\n        sampler: { type: adaptive_throughput, goal_throughput: 75, fingerprint_attributes: ['resource.attributes[\"service.name\"]'] }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling] }\n");
  const mixedResult = jsonReport(["plan", "--config", mixed.config, "--budget", "600", "--replicas", "8", "--scenario", "3,5,8", "--input", "12000"]);
  expect(mixedResult.output.status).toBe(0);
  expect(mixedResult.report.recommended_local_throughput_goal).toBeCloseTo(45);
  const appliedYaml = readFileSync(mixed.config, "utf8").replace("goal_throughput: 75", `goal_throughput: ${mixedResult.report.recommended_local_throughput_goal}`);
  writeFileSync(mixed.config, appliedYaml);
  const applied = jsonReport(["plan", "--config", mixed.config, "--budget", "600", "--replicas", "8", "--scenario", "3,5,8", "--input", "12000"]);
  expect(applied.report.scenarios.every((row: { estimated_export_spans_per_second: number }) => row.estimated_export_spans_per_second <= applied.report.maximum_allowed_spans_per_second)).toBe(true);
  rmSync(mixed.directory, { recursive: true });
});

test("@claim:unsupported-policy rejects an unknown sampling processor", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "CLI contract is covered once in Chromium");
  const directory = mkdtempSync(join(tmpdir(), "sbc-unsupported-"));
  const config = join(directory, "collector.yaml");
  writeFileSync(config, "processors:\n  tail_sampling: {}\nservice:\n  pipelines:\n    traces: { processors: [tail_sampling] }\n");
  const output = run(["plan", "--config", config, "--budget", "600"]);
  expect(output.status).toBe(2);
  expect(output.stderr).toContain("not supported");
  rmSync(directory, { recursive: true });
});

test("@claim:mit-license exposes the MIT terms", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Free under the MIT License.")).toBeVisible();
  expect(readFileSync(join(process.cwd(), "LICENSE"), "utf8")).toContain("Permission is hereby granted, free of charge");
});

test("claims manifest maps every claim to exactly one tagged test", async () => {
  const claims = JSON.parse(readFileSync(join(process.cwd(), ".factory", "claims.json"), "utf8")) as Array<{ id: string; test: string }>;
  const sources = readdirSync(join(process.cwd(), "site", "tests"))
    .filter((name) => name.endsWith(".ts"))
    .map((name) => readFileSync(join(process.cwd(), "site", "tests", name), "utf8"))
    .join("\n");
  for (const claim of claims) {
    const tag = `@claim:${claim.id}`;
    expect(claim.test).toContain(`-- ${tag}`);
    expect(sources.split(tag)).toHaveLength(2);
  }
});
