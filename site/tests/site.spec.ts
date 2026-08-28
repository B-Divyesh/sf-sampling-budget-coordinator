import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("planner recalculates the fleet and generates an assertion", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Sampling Budget Coordinator/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("One budget. Every collector.");
  await expect(page.getByText("Over budget", { exact: true })).toBeVisible();
  await page.getByLabel(/Configured local goal/).fill("60");
  await page.getByRole("button", { name: "Recalculate budget" }).click();
  await expect(page.getByText("Within budget", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Generated CLI assertion")).toHaveValue(/--replicas 8/);
});

test("invalid planner input explains the correction", async ({ page }) => {
  await page.goto("/#planner");
  await page.getByLabel("Peak replicas").fill("2");
  await page.getByRole("button", { name: "Recalculate budget" }).click();
  await expect(page.getByRole("alert")).toContainText("greater than or equal");
  await expect(page.getByLabel("Peak replicas")).toHaveAttribute("aria-invalid", "true");
});

test("main page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("dark treatment remains accessible and load is error-free", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (exception) => errors.push(exception.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use dark theme" }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  expect(errors).toEqual([]);
});

test("offline state explains that local planning still works", async ({ page, context }) => {
  await page.goto("/");
  await context.setOffline(true);
  await expect(page.getByRole("status").filter({ hasText: "planner still works locally" })).toBeVisible();
  await page.getByLabel(/Configured local goal/).fill("60");
  await page.getByRole("button", { name: "Recalculate budget" }).click();
  await expect(page.getByText("Within budget", { exact: true })).toBeVisible();
});

test("legal pages render with one main heading", async ({ page }) => {
  for (const path of ["/privacy/", "/terms/"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
});

test("skip links move keyboard focus to main content", async ({ page }) => {
  for (const path of ["/", "/privacy/", "/terms/"]) {
    await page.goto(path);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  }
});

test("a new service worker discards an old shell cache", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "service-worker upgrade is covered once in Chromium");
  const context = await browser.newContext();
  const page = await context.newPage();
  const oldCache = "sbc-shell-previous-release";
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.register("/sw-previous-test.js"));
  await page.waitForFunction(() => navigator.serviceWorker.controller?.scriptURL.endsWith("/sw-previous-test.js"));
  await expect
    .poll(() => page.evaluate(async (name) => (await caches.keys()).includes(name), oldCache))
    .toBe(true);

  await page.evaluate(async () => {
    const changed = new Promise<void>((resolve) =>
      navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })
    );
    await navigator.serviceWorker.register("/sw.js");
    await changed;
  });
  await expect
    .poll(() => page.evaluate(async (name) => (await caches.keys()).includes(name), oldCache))
    .toBe(false);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("One budget. Every collector.");
  await context.close();
});

test("390px layout does not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only layout assertion");
  await page.goto("/");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("button", { name: "Recalculate budget" })).toBeVisible();
});
