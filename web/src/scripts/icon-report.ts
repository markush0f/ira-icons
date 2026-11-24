import { requireElement } from './dom.ts';
import { t } from './i18n.ts';

type ReportState = 'pending' | 'saved' | 'failed';

/** Sends a report and optional comment for the exact variant shown in the panel. */
export function mountIconReport(panel: Pick<ParentNode, 'querySelector'>): (name: string) => void {
  const report = panel.querySelector<HTMLFormElement>("[data-icon-report]");
  if (!report) return () => {};

  const button = requireElement<HTMLButtonElement>("[data-report-button]", report);
  const commentPanel = requireElement<HTMLDetailsElement>("[data-report-comment-panel]", report);
  const commentInput = requireElement<HTMLTextAreaElement>("[data-report-comment]", report);
  const status = requireElement("[data-report-status]", report);
  const states = new Map<string, ReportState>();
  const drafts = new Map<string, string>();
  const messages = {
    pending: t("report.pending"),
    saved: t("report.saved"),
    failed: t("report.failed"),
  };
  let selectedName = '';

  function render() {
    const state = states.get(selectedName);
    button.disabled = state === "pending" || state === "saved";
    commentInput.disabled = button.disabled;
    commentPanel.hidden = state === "saved";
    status.textContent = state ? messages[state] : "";
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
