const packageOptions = document.querySelector("[data-package-options]");
const installSnippet = document.querySelector("[data-install-command] [data-snippet]");

function resetCopyFeedback(snippet) {
  snippet.querySelector("[data-copy-label]").textContent = "Copy";
  snippet.querySelector("[data-copy-feedback]").textContent = "";
}

if (packageOptions && installSnippet) {
  const command = installSnippet.querySelector("[data-snippet-code]");
  const syncCommand = () => {
    const selected = packageOptions.querySelector("input:checked");
    if (selected && command.textContent !== selected.value) {
      command.textContent = selected.value;
      resetCopyFeedback(installSnippet);
    }
  };

  syncCommand();
  packageOptions.hidden = false;
  packageOptions.addEventListener("change", syncCommand);
  window.addEventListener("pageshow", syncCommand);
}

if (navigator.clipboard?.writeText) {
  for (const snippet of document.querySelectorAll("[data-snippet]")) {
    const button = snippet.querySelector("[data-copy-snippet]");
    const label = snippet.querySelector("[data-copy-label]");
    const feedback = snippet.querySelector("[data-copy-feedback]");
    const code = snippet.querySelector("[data-snippet-code]");
    let copyRequest = 0;
    let resetTimer;

    button.hidden = false;
    button.addEventListener("click", async () => {
      const request = ++copyRequest;
      const text = code.textContent;
      clearTimeout(resetTimer);
      resetCopyFeedback(snippet);
      let copied = false;

      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // The snippet remains selectable if the browser blocks clipboard access.
      }

      if (request !== copyRequest || text !== code.textContent) return;
      label.textContent = copied ? "Copied" : "Copy failed";
      feedback.textContent = copied
        ? "Copied to clipboard."
        : "Couldn't copy. Select the code and copy it manually.";
      resetTimer = setTimeout(() => resetCopyFeedback(snippet), 2500);
    });
  }
}
