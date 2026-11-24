import type { MessageKey } from "./messages.ts";

/** Maps stable English API errors to dictionary keys. The route itself stays language-neutral. */
export const apiErrorKeys = {
  "Icon generation is not open yet.": "api.closed",
  "Gemini isn’t configured on the server.": "api.unconfigured",
  "Expected JSON.": "api.json",
  "Use the icon studio to generate an icon.": "api.studio",
  "Enter a description of up to 400 characters and choose a style.": "api.brief",
  "Choose a generation step.": "api.step",
  "The original icon is invalid. Generate it again.": "api.invalidOriginal",
  "The studio is busy or has reached its generation limit. Try again later.": "api.busy",
  "Gemini is temporarily unavailable. Try again later.": "api.unavailable",
  "Couldn’t generate a valid icon. Try again later or simplify the description.": "api.invalid",
} as const satisfies Record<string, MessageKey>;
