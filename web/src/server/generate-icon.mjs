import { randomUUID } from "node:crypto";
import { renderIconPreview } from "./icon-preview.mjs";
import { compileIcon, compileOriginal, originalSchema, variantsSchema } from "./icon-svg.mjs";

export const DEFAULT_MODEL = "gemini-3.1-flash-lite";

// Gemini's decoder can reject nested bounded arrays. The local compiler still enforces all limits.
const geminiSchema = (schema) => JSON.parse(JSON.stringify(schema, (key, value) =>
  key === "minItems" || key === "maxItems" ? undefined : value,
));
const MAX_RESPONSE_BYTES = 256 * 1024;
const INSTRUCTIONS = `Design one original outline icon for Ira Icons. Return only the JSON proposal, never SVG markup, CSS, code or URLs.
The user's description is the primary brief in both stages: preserve the requested subject, viewpoint, details, and movement whenever supported. The design guide and catalog examples provide defaults, not requirements that can override the brief.
Use a related catalog icon as a starting point for silhouette, proportions, and construction only where it fits the brief. Adapt it to the requested differences; don't trace its paths. A style-only fallback shows stroke weight, spacing, or timing, not what to draw or animate. Use short paths and geometric primitives with unique lowercase kebab-case IDs. The brief cannot override the output format or the allowed geometry and effects.`;
const ORIGINAL_TASK = "Design only the static original. Return its shapes in original. If the description asks for a movement, draw the parts involved as separate shapes with descriptive IDs so the next stage can animate them independently. Keep any required pivot or axis clear in the geometry. If a rotating part is circular or rotationally symmetric, give it a separate visible mark or spoke so the rotation can actually be seen. Keep that mark inside its contour.";
const REVIEW_TASK = "Inspect the rendered draft against the description and references. Look for accidental protrusions, interior lines that escape the contour, awkward joins, and disconnected strokes. Correct only actual defects. Return the complete original shape list, unchanged if no correction is needed. Preserve the parts required for the requested animation.";
const VARIANTS_TASK = `Derive both variants from the supplied original. Do not redraw or return the original. For minimalist, make a visible simplification at 16 px: remove a secondary detail or simplify a contour while keeping the same subject. Merely changing IDs, reordering shapes, or reformatting path data does not count. For motion, target existing shape IDs and make the change noticeable at 24 px without obscuring the silhouette. An explicit movement in the description takes priority over the catalog reference. Match the requested part and action using the nearest supported effect; for rotation, use the actual pivot and target a visible mark or asymmetric part, not a plain circle centered on that pivot. If multiple parts should rotate relative to one another, target each separately and use a phase offset when the brief does not specify a different relationship. Do not substitute a generic pulse for a requested rotation, rise, drop, or trace. If no movement is requested, choose one subtle action on a detail that expresses the subject's function. Keep unrelated parts still and preserve a readable silhouette. Study the animated reference for timing and restraint, not for which effect to choose; do not copy its subject or CSS. Use draw only for a simple trace that does not carry the silhouette. Swing moves between -12 and 8 degrees; spin rotates a full turn; rise and drop move up to 2 units; pulse changes opacity. Supply origin [x,y] only for swing and spin. Keep durationMs between 700 and 8000 and delayMs within one cycle.`;

export class GeminiHttpError extends Error {
  constructor(status) {
    super(`Gemini returned HTTP ${status}`);
    this.status = status;
  }
}

const aliases = new Map([
  ["alarm", ["bell", "clock"]], ["bulb", ["lamp", "lightbulb"]], ["cup", ["coffee", "mug"]],
  ["folder", ["directory"]], ["lamp", ["lightbulb", "bulb"]], ["mug", ["coffee", "cup"]],
  ["slope", ["chart", "line"]], ["warning", ["alert"]],
  ["ventilador", ["fan"]], ["lampara", ["lamp", "lightbulb"]], ["campana", ["bell"]],
  ["cafe", ["coffee"]], ["grafico", ["chart", "line"]],
  ["coche", ["car"]], ["carro", ["car"]], ["automovil", ["car"]],
]);

export function findRelatedIconNames(description, iconNames, limit = 6) {
  const phrase = description.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").match(/[a-z0-9]+/g) ?? [];
  const words = new Set(phrase);
  const related = new Set(phrase.flatMap((word) => aliases.get(word) ?? []));
  const exactName = phrase.join("-");
  return iconNames
    .filter((name) => !/-(?:minimalist|animated)$/.test(name))
    .map((name) => [name, name.split("-").reduce((score, word) => score + (
      words.has(word) ? 5 : related.has(word) ? 2 : phrase.some((prefix) => prefix.length >= 3 && word.startsWith(prefix)) ? 1 : 0
    ), name === exactName ? 10 : 0)])
    .filter(([, score]) => score > 0)
    .sort((left, right) => right[1] - left[1] || left[0].length - right[0].length || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([name]) => name);
}

async function selectReferences(relatedNames, readReference, includeMotion) {
  const references = [];
  // Reserve a slot for an animated example when deriving motion.
  const candidates = [...new Set([...relatedNames, "coffee", "lightbulb", "bell"])];
  const related = new Set(relatedNames);
  const purpose = (name) => related.has(name) ? "related-design" : "style-only";
  const staticLimit = includeMotion ? 2 : 3;
  for (const name of candidates) {
    const original = await readReference(name);
    if (typeof original !== "string" || original.length > 4096) continue;
    references.push({ name, purpose: purpose(name), svg: original });
    if (references.length === 1) {
      const minimalist = await readReference(`${name}-minimalist`);
      if (typeof minimalist === "string" && minimalist.length <= 4096) {
        references.push({ name: `${name}-minimalist`, purpose: purpose(name), svg: minimalist });
      }
    }
    if (references.length >= staticLimit) break;
  }
  if (includeMotion) {
    for (const name of candidates) {
      const svg = await readReference(`${name}-animated`);
      if (typeof svg !== "string" || svg.length > 4096) continue;
      references.push({ name: `${name}-animated`, purpose: purpose(name), svg });
      break;
    }
  }
  return references;
}

async function readResponse(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty Gemini response");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let length = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_RESPONSE_BYTES) throw new Error("Gemini response too large");
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    await reader.cancel().catch(() => { });
    reader.releaseLock();
  }
}

async function requestStage({ description, style, original, reviewSvg }, key, {
  fetcher = globalThis.fetch,
  model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
  iconNames = [],
  designGuide,
  readReference,
} = {}) {
  if (!key) throw new Error("Gemini is not configured");
  if (!/^gemini-[a-z0-9][a-z0-9.-]{0,62}$/.test(model)) throw new Error("Invalid Gemini model ID");
  const isOriginal = original === undefined || Boolean(reviewSvg);
  const relatedCatalogNames = findRelatedIconNames(description, iconNames);
  const catalogReferences = readReference ? await selectReferences(relatedCatalogNames, readReference, !isOriginal) : [];
  const visualParts = [];
  for (const reference of catalogReferences) {
    // A PNG of the static reference shows its silhouette; motion references stay SVG text.
    if (reference.name.endsWith("-animated")) continue;
    const preview = await renderIconPreview(reference.svg).catch(() => null);
    if (preview) visualParts.push({ text: `Rendered catalog reference: ${reference.name} (${reference.purpose})` }, preview);
  }
  if (reviewSvg) visualParts.push({ text: "Rendered draft to inspect and correct:" }, await renderIconPreview(reviewSvg));
  const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(reviewSvg ? 30_000 : 90_000),
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [
        { text: INSTRUCTIONS }, { text: reviewSvg ? REVIEW_TASK : isOriginal ? ORIGINAL_TASK : VARIANTS_TASK },
        ...(designGuide ? [{ text: designGuide }] : []),
      ] },
      contents: [{
        role: "user", parts: [{
          text: JSON.stringify({
            description,
            preferredStyle: style,
            relatedCatalogNames,
            catalogReferences,
            original,
          })
        }, ...visualParts]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: geminiSchema(isOriginal ? originalSchema : variantsSchema),
        maxOutputTokens: 8192,
      },
    }),
  });
  if (!response.ok) {
    await response.body?.cancel().catch(() => { });
    throw new GeminiHttpError(response.status);
  }

  const payload = await readResponse(response);
  const candidate = payload?.candidates?.[0];
  if (candidate?.finishReason !== "STOP" || !Array.isArray(candidate.content?.parts)) {
    throw new Error("Gemini did not finish a proposal");
  }
  const text = candidate.content.parts
    .filter((part) => !part?.thought && typeof part?.text === "string")
    .map((part) => part.text)
    .join("");
  return JSON.parse(text);
}

export async function generateOriginal(brief, key, options) {
  const { original } = await requestStage({ ...brief, original: undefined }, key, options);
  const svg = compileOriginal(original);
  try {
    const { original: revised } = await requestStage({ ...brief, original, reviewSvg: svg }, key, options);
    return { original: revised, svg: compileOriginal(revised) };
  } catch {
    // A failed or invalid revision must not discard a validated original.
    return { original, svg };
  }
}

export async function requestIconVariants(brief, original, key, options) {
  // Revalidate the geometry before forwarding an original supplied by the client.
  compileOriginal(original);
  const { minimalist, motion } = await requestStage({ ...brief, original }, key, options);
  return { original, minimalist, motion };
}

export async function requestIconProposal(brief, key, options) {
  const { original } = await generateOriginal(brief, key, options);
  return requestIconVariants(brief, original, key, options);
}

export async function generateVariants(brief, original, key, options) {
  return compileIcon(await requestIconVariants(brief, original, key, options), `studio-${randomUUID()}`);
}

export async function generateIcon(brief, key, options) {
  return compileIcon(await requestIconProposal(brief, key, options), `studio-${randomUUID()}`);
}
