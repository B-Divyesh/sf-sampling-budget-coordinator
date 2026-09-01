document.querySelectorAll<HTMLAnchorElement>('a.skip-link[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, "", link.hash);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  });
});

const routeHeading = document.querySelector<HTMLElement>("h1");
if (routeHeading) {
  routeHeading.tabIndex = -1;
  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin === window.location.origin && destination.pathname !== window.location.pathname) {
      history.replaceState({ ...history.state, focusRouteHeading: true }, "");
    }
  });
  let cameFromThisSite = false;
  try {
    cameFromThisSite = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
  } catch {
    cameFromThisSite = false;
  }
  if (cameFromThisSite || history.state?.focusRouteHeading === true) {
    requestAnimationFrame(() => routeHeading.focus());
  }
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) requestAnimationFrame(() => routeHeading.focus());
  });
}

const themeButton = document.getElementById("theme-toggle") as HTMLButtonElement | null;
themeButton?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const next = current ? (current === "dark" ? "light" : "dark") : systemDark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeButton.setAttribute("aria-label", `Use ${next === "dark" ? "light" : "dark"} theme`);
  themeButton.textContent = next === "dark" ? "☼" : "◐";
});
