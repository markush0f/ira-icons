import type { APIRoute } from "astro";
import { iconNames } from "../../icons/icons.ts";
import { MAX_REPORT_COMMENT_LENGTH } from "../../lib/icon-report.ts";
import { CREATE_COMING_SOON } from "../../lib/feature-flags.ts";

export const prerender = false;

const validNames = new Set(iconNames);

async function readReport(request: Request): Promise<Record<string, unknown> | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const bytes = new Uint8Array(4096);
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.length > bytes.length) {
        await reader.cancel();
        return null;
      }
      bytes.set(value, size);
      size += value.length;
    }
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes.subarray(0, size)));
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (CREATE_COMING_SOON) return new Response(null, { status: 404 });

  // JSON requires a CORS preflight from other sites; this endpoint doesn't enable CORS.
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    return new Response(null, { status: 415 });
  }
  if (["same-site", "cross-site"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    return new Response(null, { status: 403 });
  }

  const report = await readReport(request);
  if (typeof report?.name !== "string") return new Response(null, { status: 400 });
  if (!validNames.has(report.name)) return new Response(null, { status: 404 });
  const comment = report.comment;
  if (comment != null && (typeof comment !== "string" || comment.length > MAX_REPORT_COMMENT_LENGTH)) {
    return new Response(null, { status: 400 });
  }

  try {
    const { saveIconReport } = await import("../../server/icon-reports.ts");
    saveIconReport(report.name, comment?.trim() || null);
    return new Response(null, { status: 201 });
  } catch (error) {
    console.error("Could not save icon report", error);
    return new Response(null, { status: 503 });
  }
};
