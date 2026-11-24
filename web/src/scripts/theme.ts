type Theme = 'light' | 'dark';

(() => {
  const root = document.documentElement;
  if (root.dataset.themeBound === "true") return;
  root.dataset.themeBound = "true";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const storageKey = "ira-icons-theme";

  function readPreference(): Theme | null {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // Fall back to the system preference if storage is unavailable.
    }
    return null;
  }

  let preference = readPreference();

  function syncTheme() {
    const theme = preference ?? (systemTheme.matches ? "dark" : "light");
    root.dataset.theme = theme;
    document.querySelector("#theme-toggle")?.setAttribute("aria-pressed", String(theme === "dark"));
  }

  syncTheme();
  document.addEventListener("DOMContentLoaded", syncTheme, { once: true });
  document.addEventListener("astro:page-load", syncTheme);
  systemTheme.addEventListener("change", syncTheme);
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    preference = readPreference();
    syncTheme();
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("#theme-toggle")) return;
    preference = root.dataset.theme === "dark" ? "light" : "dark";
    syncTheme();
    try {
      localStorage.setItem(storageKey, preference);
    } catch {
      // The theme remains active for this page if storage is unavailable.
    }
  });
})();
