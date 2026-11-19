/** Adds persistent theme switching and live filtering to the server-rendered catalog. */
const root = document.documentElement;
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggle = document.querySelector("#theme-toggle");

if (themeToggle) {
  const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : systemTheme.matches;
  const syncToggle = () => themeToggle.setAttribute("aria-pressed", String(isDark()));

  themeToggle.addEventListener("click", () => {
    const theme = isDark() ? "light" : "dark";
    root.dataset.theme = theme;
    try {
      localStorage.setItem("ira-icons-theme", theme);
    } catch {
      // The theme remains active for this page if storage is unavailable.
    }
    syncToggle();
  });

  systemTheme.addEventListener("change", syncToggle);
  syncToggle();
  themeToggle.hidden = false;
}

const searchField = document.querySelector("#search-field");
const searchInput = document.querySelector("#icon-search");
const count = document.querySelector("#icon-count");
const emptyState = document.querySelector("#empty-state");
const cards = document.querySelectorAll("#icon-grid [data-icon-name]");
// Each card owns its color picker, so changing one icon never affects the others.
for (const card of cards) {
  const colorInput = card.querySelector("[data-color-control]");

  if (colorInput) {
    colorInput.addEventListener("input", () => {
      card.querySelectorAll("svg").forEach((icon) => {
        icon.setAttribute("color", colorInput.value);
      });
    });
  }
}

if (searchField && searchInput && count && emptyState) {
  const filterIcons = () => {
    // Treat spaces and hyphens alike so "arrow left" also finds "arrow-left".
    const query = searchInput.value.trim().toLowerCase().replace(/[\s-]+/g, " ");
    let matches = 0;
    for (const card of cards) {
      const name = card.dataset.iconName.replaceAll("-", " ");
      card.hidden = !name.includes(query);
      if (!card.hidden) matches++;
    }
    count.textContent = `${matches} ${matches === 1 ? "icon" : "icons"}`;
    emptyState.hidden = matches !== 0;
  };

  searchInput.addEventListener("input", filterIcons);
  filterIcons();
  searchField.hidden = false;
}
