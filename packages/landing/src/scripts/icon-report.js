/** Sends a report and optional comment for the exact variant shown in the panel. */
export function mountIconReport(panel) {
  const report = panel.querySelector("[data-icon-report]");
  const button = report.querySelector("[data-report-button]");
  const commentPanel = report.querySelector("[data-report-comment-panel]");
  const commentInput = report.querySelector("[data-report-comment]");
  const status = report.querySelector("[data-report-status]");
  const states = new Map();
  const drafts = new Map();
  const messages = {
    pending: "Sending report…",
    saved: "Report saved.",
    failed: "Couldn’t save the report. Try again.",
  };
  let selectedName;

  function render() {
    const state = states.get(selectedName);
    button.disabled = state === "pending" || state === "saved";
    commentInput.disabled = button.disabled;
    commentPanel.hidden = state === "saved";
    status.textContent = messages[state] ?? "";
  }

  commentInput.addEventListener("input", () => {
    drafts.set(selectedName, commentInput.value);
  });

  report.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!selectedName || button.disabled) return;
    const name = selectedName;
    const comment = commentInput.value.trim();
    states.set(name, "pending");
    render();

    try {
      const response = await fetch("/api/icon-reports", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment ? { name, comment } : { name }),
      });
      if (response.status !== 201) throw new Error("Report not saved");
      states.set(name, "saved");
      drafts.delete(name);
      if (selectedName === name) {
        commentInput.value = "";
        commentPanel.open = false;
      }
    } catch {
      states.set(name, "failed");
    }

    if (selectedName === name) render();
  });

  return (name) => {
    if (name !== selectedName) {
      commentInput.value = drafts.get(name) ?? "";
      commentPanel.open = Boolean(commentInput.value);
    }
    selectedName = name;
    report.hidden = false;
    render();
  };
}
