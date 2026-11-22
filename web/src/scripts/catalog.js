/** Adds icon search, selection, color editing, and clipboard export. */
import { formatIcon } from "./icon-copy.js";
import { mountIconReport } from "./icon-report.js";

const detailPanel = document.querySelector("#detail-panel");
const detailColumn = detailPanel.closest(".detail-column");
const workspace = detailColumn.parentElement;
const detailDialog = document.querySelector("#detail-dialog");
const compactCatalog = window.matchMedia("(max-width: 48rem)");
const supportsDialog = typeof detailDialog?.showModal === "function";
const selectReportIcon = mountIconReport(detailPanel);
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
const variantPicker = detailPanel.querySelector("[data-variant-picker]");
const variantButtons = [...variantPicker.querySelectorAll("[data-suffix]")];
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

function syncDetailState() {
  const compact = compactCatalog.matches && supportsDialog;
  const button = selectedCard?.querySelector("[data-select-icon]");
  button?.setAttribute("aria-expanded", String(!compact || detailDialog.open));
}

function selectVariant(card, name) {
  selectedCard?.classList.remove("is-selected");
  selectedCard?.querySelector("[data-select-icon]").setAttribute("aria-expanded", "false");
  selectedCard = card;
  clearCopyStatus();
  card.classList.add("is-selected");
  card.dataset.iconName = name;
  syncDetailState();
  for (const option of variantButtons) {
    option.setAttribute("aria-pressed", String(card.dataset.family + option.dataset.suffix === name));
  }
  for (const sample of card.querySelectorAll("[data-preview]")) {
    sample.hidden = sample.dataset.preview !== name;
  }
  const svg = card.querySelector("[data-preview]:not([hidden]) svg");
  const color = iconColors.get(name) ?? "#ad8af3";
  svg.setAttribute("color", color);
  const preview = svg.cloneNode(true);
  preview.setAttribute("width", "96");
  preview.setAttribute("height", "96");
  detailPreview.replaceChildren(preview);
  detailTitle.textContent = name;
  setPickerColor(color);
  selectReportIcon(name);
}

if (supportsDialog) {
  workspace.classList.add("has-detail-dialog");
  detailDialog.addEventListener("close", () => {
    if (!detailDialog.open) workspace.append(detailColumn);
    syncDetailState();
  });
  compactCatalog.addEventListener("change", ({ matches }) => {
    if (!matches && detailDialog.open) detailDialog.close();
    syncDetailState();
  });
}

for (const card of cards) {
  card.querySelector("[data-select-icon]").addEventListener("click", () => {
    selectVariant(card, card.dataset.iconName);
    if (!compactCatalog.matches) return;
    if (supportsDialog) {
      detailDialog.append(detailColumn);
      detailDialog.showModal();
      syncDetailState();
      detailDialog.scrollTop = 0;
    } else {
      detailPanel.focus({ preventScroll: true });
      detailPanel.scrollIntoView({ block: "start" });
    }
  });
}
for (const option of variantButtons) {
  option.addEventListener("click", () => {
    selectVariant(selectedCard, selectedCard.dataset.family + option.dataset.suffix);
  });
}

if (selectedCard) {
  selectVariant(selectedCard, selectedCard.dataset.iconName);
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
  selectedCard.querySelector("[data-preview]:not([hidden]) svg").setAttribute("color", color);
  detailPreview.querySelector("svg").setAttribute("color", color);
});

if (searchField && searchInput && count && emptyState) {
  const filterIcons = () => {
    // Treat spaces and hyphens alike so "arrow left" also finds "arrow-left".
    const query = searchInput.value.trim().toLowerCase().replace(/[\s-]+/g, " ");
    let matches = 0;
    for (const card of cards) {
      card.hidden = !variantButtons.some(option =>
        ((card.dataset.family + option.dataset.suffix).replaceAll("-", " ") + " " + option.getAttribute("aria-label").toLowerCase()).includes(query)
      );
      if (!card.hidden) matches++;
    }
    count.textContent = `${matches} ${matches === 1 ? "icon" : "icons"}`;
    emptyState.hidden = matches !== 0;
    if (selectedCard?.hidden) {
      const firstVisible = cards.find((card) => !card.hidden);
      if (firstVisible) selectVariant(firstVisible, firstVisible.dataset.iconName);
    }
  };

  searchInput.value = new URLSearchParams(window.location.search).get("q") ?? searchInput.value;
  searchInput.addEventListener("input", filterIcons);
  filterIcons();
  searchField.hidden = false;
}
