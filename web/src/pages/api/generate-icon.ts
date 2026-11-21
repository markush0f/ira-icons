import type { APIRoute } from "astro";
import { iconNames } from "../../icons/icons.mjs";
import { CREATE_COMING_SOON } from "../../lib/feature-flags.mjs";
import { GeminiHttpError, generateIcon } from "../../server/generate-icon.mjs";

export const prerender = false;

const styles = new Set(["original", "minimalist", "animated"]);
const recentRequests: number[] = [];
let busy = false;

function json(status: number, value: unknown, headers: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

async function readBrief(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const bytes = new Uint8Array(4096);
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.length + length > bytes.length) {
        await reader.cancel();
        return null;
      }
      bytes.set(value, length);
      length += value.length;
    }
    return JSON.parse(new TextDecoder().decode(bytes.subarray(0, length)));
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (CREATE_COMING_SOON) return json(404, { error: "Icon generation is not open yet." });
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return json(503, { error: "Gemini isn’t configured on the server." });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return json(415, { error: "Expected JSON." });
  }
  if (["same-site", "cross-site"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    return json(403, { error: "Use the icon studio to generate an icon." });
  }

  const brief = await readBrief(request);
  const description = typeof brief?.description === "string" ? brief.description.trim() : "";
  if (!description || description.length > 400 || !styles.has(brief?.style)) {
    return json(400, { error: "Enter a description of up to 400 characters and choose a style." });
  }

  const now = Date.now();
  const windowMs = 60 * 60_000;
  while (recentRequests.length && now - recentRequests[0] >= windowMs) recentRequests.shift();
  if (busy || recentRequests.length >= 10) {
    const retryAfter = busy ? 15 : Math.ceil((recentRequests[0] + windowMs - now) / 1000);
    return json(429, { error: "The studio is busy or has reached its generation limit. Try again later." }, { "Retry-After": String(retryAfter) });
  }

  busy = true;
  recentRequests.push(now);
  try {
    const variants = await generateIcon({ description, style: brief.style }, key, { iconNames });
    return json(200, { variants });
  } catch (error) {
    if (error instanceof GeminiHttpError && (error.status === 429 || error.status >= 500)) {
      return json(503, { error: "Gemini is temporarily unavailable. Try again later." });
    }
    return json(502, { error: "Couldn’t generate a valid icon. Try again later or simplify the description." });
  } finally {
    busy = false;
  }
};
