import type { APIRoute } from "astro";
import { GEMINI_API_KEY, GEMINI_MODEL } from "astro:env/server";
import { iconNames } from "../../icons/icons.ts";
import { CREATE_COMING_SOON } from "../../lib/feature-flags.ts";
import { GeminiHttpError, generateOriginal, generateVariants } from "../../server/generate-icon.ts";
import { compileOriginal } from "../../server/icon-svg.ts";
import { iconDesignContext } from "../../server/icon-design-context.ts";

import type { IconBrief, IconStyle } from '../../lib/icon-generation.ts';

export const prerender = false;

const styles = new Set(["original", "minimalist", "animated"]);
const recentRequests: number[] = [];
let busy = false;

function json(status: number, value: unknown, headers: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

async function readBrief(request: Request): Promise<Record<string, unknown> | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const bytes = new Uint8Array(24 * 1024);
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
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes.subarray(0, length)));
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (CREATE_COMING_SOON) return json(404, { error: "Icon generation is not open yet." });
  const key = GEMINI_API_KEY?.trim();
  if (!key) return json(503, { error: "Gemini isn’t configured on the server." });
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return json(415, { error: "Expected JSON." });
  }
  if (["same-site", "cross-site"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    return json(403, { error: "Use the icon studio to generate an icon." });
  }

  const brief = await readBrief(request);
  const description = typeof brief?.description === "string" ? brief.description.trim() : "";
  const style = brief?.style;
  if (!brief || !description || description.length > 400 || typeof style !== 'string' || !styles.has(style)) {
    return json(400, { error: "Enter a description of up to 400 characters and choose a style." });
  }

  const deriving = brief.stage === "variants";
  if (brief.stage !== "original" && !deriving) return json(400, { error: "Choose a generation step." });
  if (deriving) {
    try {
      compileOriginal(brief.original);
    } catch {
      return json(400, { error: "The original icon is invalid. Generate it again." });
    }
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
    const input: IconBrief = { description, style: style as IconStyle };
    const options = { ...iconDesignContext, iconNames, model: GEMINI_MODEL?.trim() || undefined };
    if (!deriving) return json(200, await generateOriginal(input, key, options));
    return json(200, { variants: await generateVariants(input, brief.original, key, options) });
  } catch (error) {
    if (error instanceof GeminiHttpError && (error.status === 429 || error.status >= 500)) {
      return json(503, { error: "Gemini is temporarily unavailable. Try again later." });
    }
    return json(502, { error: "Couldn’t generate a valid icon. Try again later or simplify the description." });
  } finally {
    busy = false;
  }
};
