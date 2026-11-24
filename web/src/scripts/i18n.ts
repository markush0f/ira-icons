import { apiErrorKeys } from "../i18n/api-errors.ts";
import type { MessageKey } from "../i18n/messages.ts";

let messages: Partial<Record<MessageKey, string>> | undefined;
let language = "";

function dictionary(): Partial<Record<MessageKey, string>> {
  const current = document.documentElement.lang || "en";
  if (messages && language === current) return messages;
  language = current;
  const node = document.getElementById("ira-i18n");
  messages = node?.textContent ? JSON.parse(node.textContent) as Partial<Record<MessageKey, string>> : {};
  return messages;
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let text = dictionary()[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export function translateApiError(message: string | undefined): string {
  const key = message && message in apiErrorKeys ? apiErrorKeys[message as keyof typeof apiErrorKeys] : undefined;
  return key ? t(key) : message || t("create.status.requestFailed");
}
