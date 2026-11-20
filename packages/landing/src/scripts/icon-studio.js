const studio = document.querySelector("[data-icon-studio]");
const prompt = studio.querySelector("#icon-prompt");
const count = studio.querySelector("[data-prompt-count]");
const styles = [...studio.querySelectorAll('input[name="icon-style"]')];
const previews = studio.querySelectorAll("[data-style-preview]");
const previewGrid = studio.querySelector("[data-preview-grid]");
const loader = studio.querySelector("[data-preview-loader]");
const generate = studio.querySelector("[data-generate-demo]");
const demoStatus = studio.querySelector("[data-demo-status]");
const copy = studio.querySelector("[data-copy-brief]");
const status = studio.querySelector("[data-brief-status]");
const storageKey = "ira-icons-studio-draft";
const demoDuration = 3000;
let generating = false;

try {
  const draft = JSON.parse(localStorage.getItem(storageKey));
  if (typeof draft?.prompt === "string") {
    prompt.value = draft.prompt.slice(0, prompt.maxLength);
  }
  const style = styles.find((input) => input.value === draft?.style);
  if (style) style.checked = true;
} catch {
  // The editor still works when the browser blocks storage.
}

function selectedStyle() {
  return styles.find((input) => input.checked).value;
}

function render() {
  const style = selectedStyle();
  count.textContent = `${prompt.value.length} / ${prompt.maxLength}`;
  copy.disabled = !prompt.value.trim();
  generate.disabled = generating;
  loader.hidden = !generating;
  previewGrid.setAttribute("aria-busy", String(generating));
  for (const option of styles) option.disabled = generating;
  for (const preview of previews) preview.hidden = generating || preview.dataset.stylePreview !== style;
}

function updateDraft() {
  render();
  status.textContent = "";
  try {
    localStorage.setItem(storageKey, JSON.stringify({ prompt: prompt.value, style: selectedStyle() }));
  } catch {
    // Keep the in-memory draft even if the browser blocks storage.
  }
}

render();
prompt.addEventListener("input", updateDraft);
for (const style of styles) style.addEventListener("change", () => {
  updateDraft();
  demoStatus.textContent = "";
});

generate.addEventListener("click", () => {
  if (generating) return;
  generating = true;
  render();
  demoStatus.classList.add("visually-hidden");
  demoStatus.textContent = "Simulating icon generation…";

  // Simulated response time. No provider is called.
  setTimeout(() => {
    generating = false;
    render();
    demoStatus.classList.remove("visually-hidden");
    demoStatus.textContent = "Demo complete. This is a catalog icon, not an AI-generated result.";
  }, demoDuration);
});

if (navigator.clipboard?.writeText) {
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    const description = prompt.value.trim();
    if (!description) return;
    const style = selectedStyle();

    try {
      await navigator.clipboard.writeText(
        `Create a 24 × 24 SVG icon with rounded strokes and currentColor.\nStyle: ${style}.\nDescription: ${description}`,
      );
      if (description === prompt.value.trim() && style === selectedStyle()) status.textContent = "Brief copied.";
    } catch {
      if (description === prompt.value.trim() && style === selectedStyle()) status.textContent = "Couldn’t copy the brief.";
    }
  });
}
