import { test as base, expect } from "@playwright/test";
import type { Browser, BrowserContext, Page, TestInfo } from "@playwright/test";

type IsolatedBrowserFixtures = {
  freshBrowser: Browser;
  context: BrowserContext;
  page: Page;
};

function contextOptions(testInfo: TestInfo) {
  const use = testInfo.project.use;
  return {
    baseURL: use.baseURL,
    colorScheme: use.colorScheme,
    deviceScaleFactor: use.deviceScaleFactor,
    hasTouch: use.hasTouch,
    isMobile: use.isMobile,
    locale: use.locale,
    reducedMotion: use.reducedMotion,
    screen: use.screen,
    userAgent: use.userAgent,
    viewport: use.viewport
  };
}

// The default Playwright `browser` fixture lives for an entire worker.  These
// tests exercise service-worker replacement and offline contexts, so keeping a
// browser alive for the whole suite meant one Chromium crash poisoned every
// later test.  Launching it as a test-scoped fixture gives each test a fresh
// process and profile.  A retry therefore starts from a clean browser too.
export const test = base.extend<IsolatedBrowserFixtures>({
  freshBrowser: async ({ playwright, browserName }, use) => {
    const browser = await playwright[browserName].launch();
    try {
      await use(browser);
    } finally {
      await browser.close();
    }
  },
  context: async ({ freshBrowser }, use, testInfo) => {
    const context = await freshBrowser.newContext(contextOptions(testInfo));
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  page: async ({ context }, use) => {
    const page = await context.newPage();
    try {
      await use(page);
    } finally {
      await page.close();
    }
  }
});

export { expect };
