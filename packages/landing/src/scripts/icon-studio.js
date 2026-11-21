const studio = document.querySelector("[data-icon-studio]");
if (studio) mountStudio(studio);

function mountStudio(studio) {
  const prompt = studio.querySelector("#icon-prompt");
  const count = studio.querySelector("[data-prompt-count]");
  const styles = [...studio.querySelectorAll('input[name="icon-style"]')];
  const previews = studio.querySelectorAll("[data-style-preview]");
  const previewGrid = studio.querySelector("[data-preview-grid]");
  const loader = studio.querySelector("[data-preview-loader]");
  const generate = studio.querySelector("[data-generate-icon]");
  const generationStatus = studio.querySelector("[data-generation-status]");
  const resultPreview = studio.querySelector("[data-generated-preview]");
  const resultImage = resultPreview.querySelector("img");
  const resultCaption = resultPreview.querySelector("[data-generated-caption]");
  const download = studio.querySelector("[data-download-icon]");
  const previewTitle = studio.querySelector("[data-preview-title]");
  const previewHint = studio.querySelector("[data-preview-hint]");
  const copy = studio.querySelector("[data-copy-brief]");
  const status = studio.querySelector("[data-brief-status]");
  const storageKey = "ira-icons-studio-draft";
  let generating = false;
  let resultUrls;

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
    generate.disabled = generating || !prompt.value.trim();
    prompt.disabled = generating;
    loader.hidden = !generating;
    previewGrid.setAttribute("aria-busy", String(generating));
    for (const option of styles) option.disabled = generating;
    for (const preview of previews) preview.hidden = generating || Boolean(resultUrls) || preview.dataset.stylePreview !== style;
    resultPreview.hidden = download.hidden = generating || !resultUrls;
    previewTitle.textContent = resultUrls ? "Generated preview" : "Reference preview";
    previewHint.textContent = resultUrls
      ? "Switch styles to inspect the result and download the SVG you want."
      : "This is a catalog example until you generate your own icon.";
    if (resultUrls) {
      if (resultImage.getAttribute("src") !== resultUrls[style]) resultImage.src = resultUrls[style];
      resultCaption.textContent = style;
      download.href = resultUrls[style];
      download.download = `generated-${style}.svg`;
    }
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
  for (const style of styles) style.addEventListener("change", updateDraft);

  generate.addEventListener("click", async () => {
    const description = prompt.value.trim();
    if (generating || !description) return;
    generating = true;
    if (resultUrls) {
      for (const url of Object.values(resultUrls)) URL.revokeObjectURL(url);
      resultImage.removeAttribute("src");
      download.removeAttribute("href");
      resultUrls = null;
    }
    render();
    generationStatus.classList.add("visually-hidden");
    generationStatus.textContent = "Generating an icon with Gemini…";

    try {
      const response = await fetch("/api/generate-icon", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, style: selectedStyle() }),
      });
      const result = await response.json();
      if (!response.ok) {
        generationStatus.textContent = result.error || "Icon generation failed.";
        return;
      }
      const variants = styles.map(({ value }) => [value, result.variants?.[value]]);
      if (!variants.every(([, svg]) => typeof svg === "string")) throw new Error("Incomplete result");
      // Load generated SVG as an image, never as markup in the page.
      resultUrls = Object.fromEntries(variants.map(([style, svg]) => [
        style, URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })),
      ]));
      generationStatus.textContent = "Icon generated.";
    } catch {
      generationStatus.textContent = "Couldn’t generate the icon. Try again later.";
    } finally {
      generating = false;
      render();
      generationStatus.classList.remove("visually-hidden");
    }
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
}
