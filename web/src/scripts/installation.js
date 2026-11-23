const packageOptions = document.querySelector("[data-package-options]");
const installBox = document.querySelector("[data-install-command]");
const installSnippet = installBox?.querySelector("[data-snippet]");
let installTarget = "react";
let syncCommand = () => {};

function resetCopyFeedback(snippet) {
  snippet.querySelector("[data-copy-label]").textContent = "Copy";
  snippet.querySelector("[data-copy-feedback]").textContent = "";
}

if (packageOptions && installSnippet) {
  const command = installSnippet.querySelector("[data-snippet-code] code");
  syncCommand = () => {
    const selected = packageOptions.querySelector("input:checked");
    if (!selected) return;
    const name = installBox.dataset.packageBase;
    const target = installTarget === "svg" ? name : `${name}-${installTarget}`;
    const text = `${selected.value} ${target}`;
    if (command.textContent !== text) {
      command.textContent = text;
      resetCopyFeedback(installSnippet);
    }
  };

  syncCommand();
  packageOptions.hidden = false;
  packageOptions.addEventListener("change", syncCommand);
  window.addEventListener("pageshow", syncCommand);
}

const exampleLinks = document.querySelector("[data-install-example-links]");
const examples = [...document.querySelectorAll("[data-install-examples] [data-install-example]")];

if (exampleLinks && examples.length) {
  const links = [...exampleLinks.querySelectorAll("a[href^='#']")];
  function showExample(hash) {
    const active = examples.find((example) => `#${example.id}` === hash)?.id ?? "react";
    installTarget = active === "next" ? "react" : active;
    syncCommand();
    for (const example of examples) {
      const selected = `#${example.id}` === hash;
      example.open = selected;
      example.hidden = !selected;
    }
    for (const link of links) {
      const selected = link.hash === hash;
      link.setAttribute("aria-controls", link.hash.slice(1));
      link.setAttribute("aria-expanded", String(selected));
      if (selected) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  }

  for (const example of examples) example.querySelector("summary").hidden = true;
  showExample("#react");
  exampleLinks.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href^='#']");
    if (!link || !examples.some((example) => `#${example.id}` === link.hash)) return;
    event.preventDefault();
    showExample(link.hash);
  });
}

if (navigator.clipboard?.writeText) {
  for (const snippet of document.querySelectorAll("[data-snippet]")) {
    const button = snippet.querySelector("[data-copy-snippet]");
    const label = snippet.querySelector("[data-copy-label]");
    const feedback = snippet.querySelector("[data-copy-feedback]");
    const code = snippet.querySelector("[data-snippet-code] code");
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
