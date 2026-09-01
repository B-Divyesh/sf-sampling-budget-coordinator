import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./site/tests",
  // Each test receives its own worker and Chromium process.  The suite performs
  // service-worker lifecycle and offline checks, so retaining one browser for
  // every test made one renderer crash able to stop the whole quality gate.
  // Keep concurrency deliberately low for predictable local and CI runs.
  fullyParallel: true,
  workers: 2,
  retries: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 30_000
  }
});
