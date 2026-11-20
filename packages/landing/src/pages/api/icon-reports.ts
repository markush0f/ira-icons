import type { APIRoute } from "astro";
import { iconNames } from "@ira-icons/astro/names";
import { MAX_REPORT_COMMENT_LENGTH } from "../../lib/icon-report.mjs";
import { saveIconReport } from "../../server/icon-reports.mjs";

export const prerender = false;

const validNames = new Set(iconNames);

async function readReport(request: Request) {
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
    return JSON.parse(new TextDecoder().decode(bytes.subarray(0, size)));
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export const POST: APIRoute = async ({ request }) => {
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
    saveIconReport(report.name, comment?.trim() || null);
    return new Response(null, { status: 201 });
  } catch (error) {
    console.error("Could not save icon report", error);
    return new Response(null, { status: 503 });
  }
};
