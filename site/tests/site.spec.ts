import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("planner recalculates the fleet and generates an assertion", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Sampling Budget Coordinator/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Keep collector sampling within budget");
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

test("every route has no serious accessibility violations", async ({ page }) => {
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")), path).toEqual([]);
  }
});

test("dark treatment stays accessible on every route and loads without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (exception) => errors.push(exception.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await page.getByRole("button", { name: "Use dark theme" }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")), path).toEqual([]);
  }
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

test("first screen names the job, audience, sample action, and three facts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Keep collector sampling within budget");
  await expect(page.getByText(/For platform engineers managing OpenTelemetry fleets/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/demo/");
  await expect(page.locator(".plain-facts li")).toHaveCount(3);
});

test("demo route starts in the used product and exposes its sandbox controls", async ({ page }) => {
  await page.goto("/demo/");
  await expect(page).toHaveTitle("Demo — Sampling Budget Coordinator");
  await expect(page.getByRole("complementary", { name: "Demo mode" })).toContainText("nothing is saved");
  await expect(page.getByText("Over budget", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start for real" })).toHaveAttribute("href", "/");
});

test("all public pages include route metadata and the product 404", async ({ page }) => {
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-card\.webp$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await expect(page.getByRole("link", { name: "Open the planner" })).toHaveAttribute("href", "/");
  const imageSize = await page.evaluate(async () => {
    const image = new Image();
    image.src = "/assets/social-card.webp";
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  expect(imageSize).toEqual({ width: 1200, height: 630 });
});

test("landing includes a self-hosted terminal transcript", async ({ page }) => {
  await page.goto("/");
  const recording = page.locator(".terminal-recording");
  await expect(recording).toContainText("$ sbc demo");
  await expect(recording).toContainText("RECOMMENDED LOCAL GOAL   75.00 spans/s per instance");
});

test("skip links move keyboard focus to main content", async ({ page }) => {
  for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  }
});

test("same-origin navigation and Back move focus to the destination heading", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("demo controls work with the keyboard and keep focus visible", async ({ page }) => {
  await page.goto("/demo/");
  await page.getByLabel(/Configured local goal/).focus();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("60");
  await page.getByRole("button", { name: "Recalculate budget" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Within budget", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByLabel(/Configured local goal/)).toHaveValue("600");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeFocused();
  const outline = await page.getByRole("button", { name: "Reset demo" }).evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe("none");
});

test("standalone header and footer navigation targets are at least 44 by 44 CSS pixels", async ({ page }, testInfo) => {
  await page.goto("/demo/");

  const requiredTargets = [
    ...(testInfo.project.name === "chromium" ? [{ region: "header", name: "Demo" }] : []),
    { region: "footer", name: "Home" },
    { region: "footer", name: "Terms" }
  ];

  for (const { region, name } of requiredTargets) {
    const target = page.locator(`${region} nav`).getByRole("link", { name, exact: true });
    await expect(target, `${testInfo.project.name} ${region} ${name}`).toBeVisible();
    const box = await target.boundingBox();
    expect(box, `${testInfo.project.name} ${region} ${name} has a box`).not.toBeNull();
    expect(box!.width, `${testInfo.project.name} ${region} ${name} width`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `${testInfo.project.name} ${region} ${name} height`).toBeGreaterThanOrEqual(44);
  }

  const standaloneLinks = page.locator(".site-header a:visible, .site-footer a:visible");
  for (let index = 0; index < (await standaloneLinks.count()); index += 1) {
    const target = standaloneLinks.nth(index);
    const label = ((await target.getAttribute("aria-label")) ?? (await target.innerText())).trim();
    const box = await target.boundingBox();
    expect(box, `${testInfo.project.name} ${label} has a box`).not.toBeNull();
    expect(box!.width, `${testInfo.project.name} ${label} width`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `${testInfo.project.name} ${label} height`).toBeGreaterThanOrEqual(44);
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Keep collector sampling within budget");
  await context.close();
});

test("390px layout does not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only layout assertion");
  for (const path of ["/", "/demo/"]) {
    await page.goto(path);
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll, path).toBeLessThanOrEqual(widths.client);
    await expect(page.getByRole("button", { name: "Recalculate budget" })).toBeVisible();
  }
});

test("200 percent text size preserves the mobile layout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile text-resize assertion");
  for (const path of ["/", "/demo/"]) {
    await page.goto(path);
    await page.evaluate(() => document.documentElement.style.fontSize = "200%");
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll, path).toBeLessThanOrEqual(widths.client);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
