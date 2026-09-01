const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
};

const form = byId<HTMLFormElement>("planner-form");
const error = byId<HTMLParagraphElement>("form-error");
const result = byId<HTMLElement>("planner-result");
const status = byId<HTMLElement>("result-status");
const recommendation = byId<HTMLElement>("recommended-goal");
const meter = byId<HTMLElement>("meter-fill");
const ledgerBody = byId<HTMLTableSectionElement>("ledger-body");
const command = byId<HTMLTextAreaElement>("assertion-command");
const copyButton = byId<HTMLButtonElement>("copy-command");
const themeButton = byId<HTMLButtonElement>("theme-toggle");
const offline = byId<HTMLElement>("offline-status");
const resetDemo = document.getElementById("reset-demo") as HTMLButtonElement | null;
const demoModeStatus = document.getElementById("demo-mode-status");

const sampleValues = {
  budget: "600",
  goal: "600",
  replicas: "3",
  peak: "8",
  input: "12000",
  tolerance: "10"
} as const;

// Keep the catalog-friendly query entry point while serving the sandbox from
// its own canonical document.  The redirect happens before any planner value
// can be changed, so `?demo=1` cannot read or write a regular-planner state.
if (document.body.dataset.demo !== "true" && new URLSearchParams(window.location.search).get("demo") === "1") {
  window.location.replace("/demo/");
}

function enableSkipLinkFocus(): void {
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
}

function focusRouteHeading(): void {
  const heading = document.querySelector<HTMLElement>("h1");
  if (!heading) return;
  heading.tabIndex = -1;
  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const destination = new URL(link.href, window.location.href);
    const entersDemoFromQuery =
      destination.searchParams.get("demo") === "1" && window.location.search !== destination.search;
    if (
      destination.origin === window.location.origin &&
      (destination.pathname !== window.location.pathname || entersDemoFromQuery)
    ) {
      history.replaceState({ ...history.state, focusRouteHeading: true }, "");
    }
  });
  const cameFromThisSite = (() => {
    try {
      return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch {
      return false;
    }
  })();
  if (cameFromThisSite || history.state?.focusRouteHeading === true) {
    requestAnimationFrame(() => heading.focus());
  }
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) requestAnimationFrame(() => heading.focus());
  });
}

type Values = {
  budget: number;
  goal: number;
  replicas: number;
  peak: number;
  input: number;
  tolerance: number;
};

const input = (name: keyof Values): HTMLInputElement =>
  form.elements.namedItem(name) as HTMLInputElement;

function readValues(): Values | null {
  const values = Object.fromEntries(
    (["budget", "goal", "replicas", "peak", "input", "tolerance"] as const).map((name) => [
      name,
      Number(input(name).value)
    ])
  ) as Values;
  let message = "";
  for (const name of Object.keys(values) as (keyof Values)[]) {
    input(name).removeAttribute("aria-invalid");
    if (!Number.isFinite(values[name]) || values[name] < 0) {
      input(name).setAttribute("aria-invalid", "true");
      message = "Enter a valid non-negative number in every field.";
    }
  }
  if (values.budget <= 0 || values.goal <= 0 || values.replicas < 1 || values.peak < 1) {
    message = "Budget and goal must be above zero; replica counts must be at least one.";
  }
  if (!Number.isInteger(values.replicas) || !Number.isInteger(values.peak)) {
    message = "Replica counts must be whole numbers.";
  }
  if (values.peak < values.replicas) {
    message = "Peak replicas must be greater than or equal to current replicas.";
    input("peak").setAttribute("aria-invalid", "true");
  }
  if (values.tolerance > 100) {
    message = "Tolerance must be between 0 and 100 percent.";
    input("tolerance").setAttribute("aria-invalid", "true");
  }
  error.textContent = message;
  return message ? null : values;
}

function fmt(value: number, maximumDigits = 1): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: maximumDigits }).format(value);
}

function calculate(values: Values): void {
  const scenarios = [...new Set([values.replicas, values.peak])].sort((a, b) => a - b);
  const allowed = values.budget * (1 + values.tolerance / 100);
  const rows = scenarios.map((replicas) => {
    const ceiling = values.goal * replicas;
    const exported = Math.min(values.input, ceiling);
    return { replicas, ceiling, exported, over: exported > allowed };
  });
  const over = rows.some((row) => row.over);
  const safeGoal = values.budget / values.peak;
  const peakExport = rows.at(-1)?.exported ?? 0;
  const utilization = (peakExport / values.budget) * 100;

  status.textContent = over ? "Over budget" : "Within budget";
  status.classList.toggle("over", over);
  recommendation.textContent = fmt(safeGoal, 2);
  meter.style.width = `${Math.min(100, utilization / 1.1)}%`;
  meter.classList.toggle("over", over);
  meter.parentElement?.setAttribute(
    "aria-label",
    `Peak estimated export is ${fmt(utilization)} percent of budget`
  );
  ledgerBody.replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement("tr");
      for (const value of [row.replicas, fmt(row.ceiling), fmt(row.exported), row.over ? "Over" : "Within"]) {
        const td = document.createElement("td");
        td.textContent = String(value);
        tr.append(td);
      }
      return tr;
    })
  );
  command.value = `sbc assert --config collector.yaml --budget ${values.budget} --replicas ${values.peak} --input ${values.input} --tolerance ${values.tolerance}`;
  result.classList.remove("has-updated");
  requestAnimationFrame(() => result.classList.add("has-updated"));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = readValues();
  if (values) calculate(values);
});

resetDemo?.addEventListener("click", () => {
  for (const [name, value] of Object.entries(sampleValues)) {
    const field = form.elements.namedItem(name) as HTMLInputElement;
    field.value = value;
    field.removeAttribute("aria-invalid");
  }
  error.textContent = "";
  calculate(readValues()!);
  if (demoModeStatus) demoModeStatus.textContent = "Demo reset — sample data, nothing is saved";
  resetDemo.focus();
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(command.value);
    copyButton.textContent = "Copied";
  } catch {
    command.focus();
    command.select();
    copyButton.textContent = "Selected";
  }
  window.setTimeout(() => (copyButton.textContent = "Copy command"), 1600);
});

themeButton.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const next = current ? (current === "dark" ? "light" : "dark") : systemDark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeButton.setAttribute("aria-label", `Use ${next === "dark" ? "light" : "dark"} theme`);
  themeButton.textContent = next === "dark" ? "☼" : "◐";
});

function updateNetworkStatus(): void {
  offline.hidden = navigator.onLine;
}
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();
enableSkipLinkFocus();
focusRouteHeading();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}

calculate(readValues()!);
document.documentElement.dataset.appReady = "true";
