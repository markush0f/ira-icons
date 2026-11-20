/** Sends a one-click report for the exact variant currently shown in the panel. */
export function mountIconReport(panel) {
  const report = panel.querySelector("[data-icon-report]");
  const button = report.querySelector("[data-report-button]");
  const status = report.querySelector("[data-report-status]");
  const states = new Map();
  const messages = {
    pending: "Sending report…",
    saved: "Report saved.",
    failed: "Couldn’t save the report. Try again.",
  };
  let selectedName;

  function render() {
    const state = states.get(selectedName);
    button.disabled = state === "pending" || state === "saved";
    status.textContent = messages[state] ?? "";
  }

  button.addEventListener("click", async () => {
    const name = selectedName;
    states.set(name, "pending");
    render();

    try {
      const response = await fetch("/api/icon-reports", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.status !== 201) throw new Error("Report not saved");
      states.set(name, "saved");
    } catch {
      states.set(name, "failed");
    }

    if (selectedName === name) render();
  });

  return (name) => {
    selectedName = name;
    report.hidden = false;
    render();
  };
}
