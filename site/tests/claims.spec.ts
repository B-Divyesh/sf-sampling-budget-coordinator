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
  writeFileSync(config, `processors:\n  adaptive_tail_sampling:\n    rules:\n      - name: default\n        sampler: { type: adaptive_throughput, goal_throughput: 60 }\nexporters:\n  otlp:\n    headers: { authorization: ${sentinel} }\nservice:\n  pipelines:\n    traces: { processors: [adaptive_tail_sampling], exporters: [otlp] }\n`);
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
