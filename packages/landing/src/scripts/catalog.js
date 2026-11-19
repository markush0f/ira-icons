/** Adds theme switching, icon search, selection, color editing, and clipboard export. */
import { formatIcon } from "./icon-copy.js";
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

const detailPanel = document.querySelector("#detail-panel");
const detailPreview = document.querySelector("#detail-preview");
const detailTitle = document.querySelector("#detail-title");
const colorPicker = document.querySelector("[data-color-picker]");
const searchField = document.querySelector("#search-field");
const searchInput = document.querySelector("#icon-search");
const count = document.querySelector("#icon-count");
const emptyState = document.querySelector("#empty-state");
const cards = [...document.querySelectorAll("#icon-grid [data-icon-name]")];
const iconColors = new Map();
const copyActions = detailPanel.querySelector("[data-icon-copy]");
const copyStatus = copyActions.querySelector("[data-copy-status]");
let copyRequest = 0;

const clearCopyStatus = () => {
  copyRequest++;
  copyStatus.textContent = "";
};
let selectedCard = cards.find((card) => card.classList.contains("is-selected")) ?? cards[0];

const setPickerColor = (color) => {
  colorPicker.dataset.color = color;
  colorPicker.style.setProperty("--picker-color", color);
  colorPicker.querySelector("[data-color-spectrum]").value = color;
  colorPicker.querySelector("[data-color-hex]").value = color.slice(1);
};

for (const card of cards) {
  const button = card.querySelector("[data-select-icon]");
  const name = card.dataset.iconName;

  button.addEventListener("click", () => {
    if (selectedCard === card) return;
    selectedCard?.classList.remove("is-selected");
    selectedCard?.querySelector("[data-select-icon]").setAttribute("aria-expanded", "false");
    selectedCard = card;
    clearCopyStatus();
    card.classList.add("is-selected");
    button.setAttribute("aria-expanded", "true");
    detailTitle.textContent = name;
    detailPreview.replaceChildren(button.querySelector("svg").cloneNode(true));
    const preview = detailPreview.querySelector("svg");
    preview.setAttribute("width", "96");
    preview.setAttribute("height", "96");
    const color = iconColors.get(name) ?? "#ad8af3";
    preview.setAttribute("color", color);
    setPickerColor(color);
  });
}

if (selectedCard) {
  const name = selectedCard.dataset.iconName;
  const preview = selectedCard.querySelector("[data-select-icon] svg").cloneNode(true);
  preview.setAttribute("width", "96");
  preview.setAttribute("height", "96");
  detailPreview.replaceChildren(preview);
  setPickerColor("#ad8af3");
  copyActions.hidden = false;
}

for (const button of copyActions.querySelectorAll("[data-copy-format]")) {
  button.addEventListener("click", async () => {
    clearCopyStatus();
    const request = copyRequest;
    const format = button.dataset.copyFormat;
    const name = selectedCard.dataset.iconName;
    try {
      const snippet = formatIcon(detailPreview.querySelector("svg"), name, format);
      await navigator.clipboard.writeText(snippet);
      if (request === copyRequest) copyStatus.textContent = `${format} copied.`;
    } catch {
      if (request === copyRequest) copyStatus.textContent = "Couldn’t copy. Check clipboard permissions and try again.";
    }
  });
}

detailPanel.addEventListener("icon-color-change", (event) => {
  if (!selectedCard) return;
  const { color } = event.detail;
  const name = selectedCard.dataset.iconName;
  clearCopyStatus();
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
    }
    count.textContent = `${matches} ${matches === 1 ? "icon" : "icons"}`;
    emptyState.hidden = matches !== 0;
    if (selectedCard?.hidden) {
      const firstVisible = cards.find((card) => !card.hidden);
      firstVisible?.querySelector("[data-select-icon]").click();
    }
  };

  searchInput.addEventListener("input", filterIcons);
  filterIcons();
  searchField.hidden = false;
}
