import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { compileIcon } from "../src/server/icon-svg.mjs";
import { DEFAULT_MODEL, findRelatedIconNames, generateIcon, GeminiHttpError } from "../src/server/generate-icon.mjs";

async function example(name) {
  const { name: _name, ...proposal } = JSON.parse(await readFile(new URL(
    `../../scripts/icon-studio/examples/${name}.json`, import.meta.url,
  ), "utf8"));
  return proposal;
}

function geminiResponse(proposal, schema) {
  const { original, minimalist, motion } = proposal;
  const stage = schema.properties.original ? { original } : { minimalist, motion };
  return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [
    { text: "reasoning is not output", thought: true },
    { text: JSON.stringify(stage) },
  ] } }] });
}

test("calls Gemini in Node and compiles the three variants without exposing the key", async () => {
  const proposal = await example("trend-study");
  let calls = 0;
  const result = await generateIcon({ description: "A chart with a rising line", style: "animated" }, "test-key", {
    model: DEFAULT_MODEL,
    iconNames: ["chart-line", "chart-line-animated", "coffee"],
    designGuide: "Prefer a recognizable silhouette at 16 px.",
    readReference: (name) => readFile(new URL(`../../icons/${name}.svg`, import.meta.url), "utf8"),
    fetcher: async (url, options) => {
      assert.equal(url, `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`);
      assert.equal(options.headers["x-goog-api-key"], "test-key");
      assert.equal(options.redirect, "error");
      assert.doesNotMatch(options.body, /test-key/);
      const body = JSON.parse(options.body);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      const schema = body.generationConfig.responseJsonSchema;
      assert.match(body.systemInstruction.parts[0].text, /description is the primary brief in both stages/);
      assert.match(body.systemInstruction.parts[2].text, /recognizable silhouette/);
      const brief = JSON.parse(body.contents[0].parts[0].text);
      const parts = body.contents[0].parts;
      const images = parts.filter((part) => part.inlineData);
      assert.ok(images.length >= 2);
      for (const { inlineData } of images) {
        assert.equal(inlineData.mimeType, "image/png");
        assert.equal(Buffer.from(inlineData.data, "base64").subarray(1, 4).toString(), "PNG");
      }
      if (++calls <= 2) {
        assert.deepEqual(Object.keys(schema.properties), ["original"]);
        assert.equal(schema.properties.original.maxItems, undefined);
        if (calls === 1) assert.equal(brief.original, undefined);
        else {
          assert.deepEqual(brief.original, proposal.original);
          assert.match(parts.at(-2).text, /Rendered draft/);
          assert.equal(images.length, 4);
        }
      } else {
        assert.deepEqual(Object.keys(schema.properties), ["minimalist", "motion"]);
        assert.equal(schema.properties.motion.items.properties.origin.maxItems, undefined);
        assert.deepEqual(brief.original, proposal.original);
      }
      assert.equal(brief.description, "A chart with a rising line");
      assert.deepEqual(brief.relatedCatalogNames, ["chart-line"]);
      assert.deepEqual(brief.catalogReferences.map(({ name }) => name), ["chart-line", "chart-line-minimalist", schema.properties.motion ? "chart-line-animated" : "coffee"]);
      assert.deepEqual(brief.catalogReferences.map(({ purpose }) => purpose), ["related-design", "related-design", schema.properties.motion ? "related-design" : "style-only"]);
      for (const { svg } of brief.catalogReferences) assert.match(svg, /^<svg\b/);
      return geminiResponse(proposal, schema);
    },
  });
  assert.equal(calls, 3);
  assert.deepEqual(Object.keys(result), ["original", "minimalist", "animated"]);
  assert.match(result.animated, /prefers-reduced-motion: no-preference/);
  assert.equal(result.animated.match(/pathLength="1"/g)?.length, 1);
  assert.doesNotMatch(result.original, /@keyframes|test-key/);
});

test("derives the variants from the visually revised original", async () => {
  const proposal = await example("trend-study");
  const revised = structuredClone(proposal);
  revised.original.push({ id: "marker", type: "circle", cx: 18, cy: 7, r: 1 });
  let calls = 0;
  const result = await generateIcon({ description: "A chart with a marker", style: "original" }, "test-key", {
    fetcher: async (_url, { body }) => {
      const request = JSON.parse(body);
      const { parts } = request.contents[0];
      const schema = request.generationConfig.responseJsonSchema;
      calls++;
      if (calls === 2) assert.ok(parts.at(-1).inlineData);
      if (calls === 3) assert.deepEqual(JSON.parse(parts[0].text).original, revised.original);
      return geminiResponse(calls === 1 ? proposal : revised, schema);
    },
  });
  assert.equal(calls, 3);
  assert.match(result.original, /<circle cx="18" cy="7" r="1"/);
  assert.match(result.animated, /<circle cx="18" cy="7" r="1"/);
});

test("matches accented Spanish briefs to catalog references", () => {
  assert.deepEqual(findRelatedIconNames("Una lámpara de escritorio", ["bell", "lightbulb"]), ["lightbulb"]);
});

test("uses the existing car animation as a reference for a Spanish car brief", async () => {
  const proposal = await example("trend-study");
  await generateIcon({ description: "Crea un coche, haz que las ruedas tenga animacion moviendose entre si", style: "animated" }, "test-key", {
    iconNames: ["car", "car-animated"],
    readReference: (name) => readFile(new URL(`../../icons/${name}.svg`, import.meta.url), "utf8"),
    fetcher: async (_url, { body }) => {
      const request = JSON.parse(body);
      const schema = request.generationConfig.responseJsonSchema;
      const brief = JSON.parse(request.contents[0].parts[0].text);
      for (const { text } of request.systemInstruction.parts) {
        assert.doesNotMatch(text, /\b(?:cars?|wheels?|coches?|ruedas?)\b/i);
      }
      assert.equal(brief.description, "Crea un coche, haz que las ruedas tenga animacion moviendose entre si");
      assert.deepEqual(brief.relatedCatalogNames, ["car"]);
      if (schema.properties.motion) {
        assert.equal(brief.catalogReferences[2].name, "car-animated");
        assert.match(brief.catalogReferences[2].svg, /data-ira-motion="car"/);
      }
      return geminiResponse(proposal, schema);
    },
  });
});

test("uses catalog fallback examples when no related icon matches", async () => {
  const proposal = await example("trend-study");
  await generateIcon({ description: "A new abstract symbol", style: "original" }, "test-key", {
    iconNames: ["bell"],
    readReference: (name) => readFile(new URL(`../../icons/${name}.svg`, import.meta.url), "utf8"),
    fetcher: async (_url, { body }) => {
      const request = JSON.parse(body);
      const schema = request.generationConfig.responseJsonSchema;
      const brief = JSON.parse(request.contents[0].parts[0].text);
      assert.deepEqual(brief.relatedCatalogNames, []);
      assert.ok(brief.catalogReferences.every(({ purpose }) => purpose === "style-only"));
      assert.deepEqual(brief.catalogReferences.map(({ name }) => name), ["coffee", "coffee-minimalist", schema.properties.motion ? "coffee-animated" : "lightbulb"]);
      return geminiResponse(proposal, schema);
    },
  });
});

test("validates swings and falling droplets through their motion range", async () => {
  assert.match(compileIcon(await example("metronome-study"), "test-meter").animated, /rotate\(-12deg\)/);
  const shower = await example("shower-study");
  assert.match(compileIcon(shower, "test-shower").animated, /-600ms/);
  shower.original[2].d = "M8 21v1";
  assert.throws(() => compileIcon(shower, "test-shower"), /Unexpected coordinate/);
});

test("rejects invisible rotation of a plain circle but animates a separate mark", () => {
  const original = [
    { id: "rim", type: "circle", cx: 12, cy: 12, r: 5 },
    { id: "spoke", type: "path", d: "M12 12v-3" },
  ];
  const proposal = { original, minimalist: [original[0]], motion: [{ target: "rim", effect: "spin", origin: [12, 12] }] };
  assert.throws(() => compileIcon(proposal, "rotation-study"), /rotation of a plain circle/i);
  proposal.motion[0].target = "spoke";
  assert.match(compileIcon(proposal, "rotation-study").animated, /data-ira-motion="rotation-study--spoke" d=|d="[^"]+" data-ira-motion="rotation-study--spoke"/);
});

test("rejects malformed SVG data and markup-like fields from the model", async () => {
  const proposal = await example("trend-study");
  const shape = proposal.original[0];
  const reordered = [...proposal.original].reverse().map((item, index) => ({ ...item, id: `copy-${index}` }));
  assert.throws(() => compileIcon({ ...proposal, minimalist: reordered }, "test-chart"), /same geometry/);
  assert.throws(() => compileIcon({ ...proposal, original: Array(17).fill(shape) }, "test-chart"), /Invalid icon shape list/);
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
