import "./style.css";

const themeButton = document.getElementById("theme-toggle") as HTMLButtonElement | null;
themeButton?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const next = current ? (current === "dark" ? "light" : "dark") : systemDark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeButton.setAttribute("aria-label", `Use ${next === "dark" ? "light" : "dark"} theme`);
  themeButton.textContent = next === "dark" ? "☼" : "◐";
});
