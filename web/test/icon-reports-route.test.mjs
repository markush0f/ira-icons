import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";
import { mountIconReport } from "../src/scripts/icon-report.js";

test("catalog can select icons when the report form is disabled", () => {
  const selectReport = mountIconReport({ querySelector: () => null });
  assert.doesNotThrow(() => selectReport("bell"));
});

async function loadRoute(comingSoon) {
  const source = await readFile(new URL("../src/pages/api/icon-reports.ts", import.meta.url), "utf8");
  // Isolate the handler from Astro's build-time environment and SQLite.
  const isolated = source
    .replace(/^import .* from .*;$/gm, "")
    .replace('await import("../../server/icon-reports.mjs")', "await loadStore()");
  const { outputText } = ts.transpileModule(isolated, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const moduleSource = `
    const CREATE_COMING_SOON = ${comingSoon};
    const iconNames = ["bell"];
    const MAX_REPORT_COMMENT_LENGTH = 500;
    export const saved = [];
    export let storeLoads = 0;
    async function loadStore() {
      storeLoads++;
      return { saveIconReport: (...args) => saved.push(args) };
    }
    ${outputText}
  `;
  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString("base64")}`);
}

function request(body) {
  return new Request("https://example.com/api/icon-reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("coming-soon mode rejects reports before reading the body or loading SQLite", async () => {
  const route = await loadRoute(true);
  const reportRequest = request({ name: "bell" });
  const response = await route.POST({ request: reportRequest });
  assert.equal(response.status, 404);
  assert.equal(reportRequest.bodyUsed, false);
  assert.equal(route.storeLoads, 0);
  assert.deepEqual(route.saved, []);
});

test("reports remain available when the shared coming-soon flag is false", async () => {
  const route = await loadRoute(false);
  const invalid = await route.POST({ request: request({ name: "missing" }) });
  assert.equal(invalid.status, 404);
  assert.equal(route.storeLoads, 0);

  const response = await route.POST({ request: request({ name: "bell", comment: "  Animation issue  " }) });
  assert.equal(response.status, 201);
  assert.equal(route.storeLoads, 1);
  assert.deepEqual(route.saved, [["bell", "Animation issue"]]);
});
