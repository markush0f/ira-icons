/** Adds theme switching, icon search, selection, and per-icon color editing. */
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

const workspace = document.querySelector("#workspace");
const detailPanel = document.querySelector("#detail-panel");
const detailPreview = document.querySelector("#detail-preview");
const detailTitle = document.querySelector("#detail-title");
const closeButton = document.querySelector("#close-detail");
const searchField = document.querySelector("#search-field");
const searchInput = document.querySelector("#icon-search");
const count = document.querySelector("#icon-count");
const emptyState = document.querySelector("#empty-state");
const cards = [...document.querySelectorAll("#icon-grid [data-icon-name]")];
const iconColors = new Map();
let selectedCard;

const closeDetails = ({ restoreFocus = false } = {}) => {
  if (!selectedCard) return;
  selectedCard.classList.remove("is-selected");
  selectedCard.querySelector("[data-select-icon]").setAttribute("aria-expanded", "false");
  if (restoreFocus) selectedCard.querySelector("[data-select-icon]").focus();
  selectedCard = undefined;
  workspace.classList.remove("has-selection");
  detailPanel.hidden = true;
};

for (const card of cards) {
  const button = card.querySelector("[data-select-icon]");
  const name = card.dataset.iconName;

  button.addEventListener("click", () => {
    if (selectedCard === card) return;
    closeDetails();
    selectedCard = card;
    card.classList.add("is-selected");
    button.setAttribute("aria-expanded", "true");
    detailTitle.textContent = name;
    detailPreview.replaceChildren(button.querySelector("svg").cloneNode(true));
    const preview = detailPreview.querySelector("svg");
    preview.setAttribute("width", "96");
    preview.setAttribute("height", "96");
    preview.setAttribute("color", iconColors.get(name) ?? "#ad8af3");
    workspace.classList.add("has-selection");
    detailPanel.hidden = false;
  });
}

closeButton.addEventListener("click", () => closeDetails({ restoreFocus: true }));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDetails({ restoreFocus: true });
});

detailPanel.addEventListener("icon-color-change", (event) => {
  if (!selectedCard) return;
  const { color } = event.detail;
  const name = selectedCard.dataset.iconName;
  iconColors.set(name, color);
  selectedCard.querySelector("svg").setAttribute("color", color);
  detailPreview.querySelector("svg").setAttribute("color", color);
});

if (searchField && searchInput && count && emptyState) {
  const filterIcons = () => {
    // Treat spaces and hyphens alike so "arrow left" also finds "arrow-left".
    const query = searchInput.value.trim().toLowerCase().replace(/[\s-]+/g, " ");
    let matches = 0;
    for (const card of cards) {
      const name = card.dataset.iconName.replaceAll("-", " ");
      card.hidden = !name.includes(query);
      if (!card.hidden) matches++;
      if (selectedCard === card && card.hidden) closeDetails();
    }
    count.textContent = `${matches} ${matches === 1 ? "icon" : "icons"}`;
    emptyState.hidden = matches !== 0;
  };

  searchInput.addEventListener("input", filterIcons);
  filterIcons();
  searchField.hidden = false;
}
