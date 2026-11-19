const root = document.documentElement;
const toggle = document.querySelector("#theme-toggle");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

if (toggle) {
  let preference = root.dataset.theme;
  const sync = () => {
    const theme = preference ?? (systemTheme.matches ? "dark" : "light");
    root.dataset.theme = theme;
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
  };

  toggle.addEventListener("click", () => {
    preference = root.dataset.theme === "dark" ? "light" : "dark";
    sync();
    try {
      localStorage.setItem("ira-icons-theme", preference);
    } catch {
      // The theme remains active for this page if storage is unavailable.
    }
  });

  systemTheme.addEventListener("change", sync);
  sync();
  toggle.hidden = false;
}
