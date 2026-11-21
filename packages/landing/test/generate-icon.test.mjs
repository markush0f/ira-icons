import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { compileIcon } from "../src/server/icon-svg.mjs";
import { DEFAULT_MODEL, generateIcon, GeminiHttpError } from "../src/server/generate-icon.mjs";

async function example(name) {
  const { name: _name, ...proposal } = JSON.parse(await readFile(new URL(
    `../../../scripts/icon-studio/examples/${name}.json`, import.meta.url,
  ), "utf8"));
  return proposal;
}

function geminiResponse(proposal) {
  return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [
    { text: "reasoning is not output", thought: true },
    { text: JSON.stringify(proposal) },
  ] } }] });
}

test("calls Gemini in Node and compiles the three variants without exposing the key", async () => {
  const proposal = await example("trend-study");
  const result = await generateIcon({ description: "A chart with a rising line", style: "animated" }, "test-key", {
    model: DEFAULT_MODEL,
    iconNames: ["chart-line", "chart-line-animated", "coffee"],
    fetcher: async (url, options) => {
      assert.equal(url, `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`);
      assert.equal(options.headers["x-goog-api-key"], "test-key");
      assert.equal(options.redirect, "error");
      assert.doesNotMatch(options.body, /test-key/);
      const body = JSON.parse(options.body);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      assert.deepEqual(JSON.parse(body.contents[0].parts[0].text).relatedCatalogNames, ["chart-line"]);
      return geminiResponse(proposal);
    },
  });
  assert.deepEqual(Object.keys(result), ["original", "minimalist", "animated"]);
  assert.match(result.animated, /prefers-reduced-motion: no-preference/);
  assert.equal(result.animated.match(/pathLength="1"/g)?.length, 1);
  assert.doesNotMatch(result.original, /@keyframes|test-key/);
});

test("validates swings and falling droplets through their motion range", async () => {
  assert.match(compileIcon(await example("metronome-study"), "test-meter").animated, /rotate\(-12deg\)/);
  const shower = await example("shower-study");
  assert.match(compileIcon(shower, "test-shower").animated, /-600ms/);
  shower.original[2].d = "M8 21v1";
  assert.throws(() => compileIcon(shower, "test-shower"), /Unexpected coordinate/);
});

test("rejects malformed SVG data and markup-like fields from the model", async () => {
  const proposal = await example("trend-study");
  const shape = proposal.original[0];
  assert.throws(() => compileIcon({ ...proposal, original: [{ ...shape, onload: "doThing()" }] }, "test-chart"), /Unexpected icon proposal fields/);
  assert.throws(() => compileIcon({ ...proposal, original: [{ ...shape, d: 'M3 4\" <path/>' }] }, "test-chart"), /Invalid SVG path data/);
  assert.throws(() => compileIcon({ ...proposal, original: [{ ...shape, d: "M3 4L5" }] }, "test-chart"));
});

test("handles an unavailable provider without exposing the response body", async () => {
  await assert.rejects(generateIcon({ description: "A bell", style: "original" }, "test-key", {
    model: DEFAULT_MODEL,
    fetcher: async () => new Response("upstream details", { status: 503 }),
  }), (error) => error instanceof GeminiHttpError && error.status === 503 && !error.message.includes("upstream details"));
});
