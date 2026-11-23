import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkFamily } from "./review.ts";

const tool = fileURLToPath(new URL("./icon-tool.ts", import.meta.url));
const spec = fileURLToPath(new URL("./examples/trend-study.json", import.meta.url));
const run = (...args: string[]) => execFileSync(process.execPath, [tool, ...args], { encoding: "utf8", stdio: "pipe" });

test("searches related catalog names", () => {
  assert.match(run("search", "desk lamp"), /lightbulb\ticons\/lightbulb\.svg/);
});

test("builds three drafts and a review sheet without overwriting an existing draft", () => {
  const temporary = mkdtempSync(join(tmpdir(), "ira-icon-tool-test-"));
  try {
    const output = join(temporary, "draft");
    run("build", spec, "--out", output);
    assert.deepEqual(readdirSync(output).sort(), ["review.html", "trend-study-animated.svg", "trend-study-minimalist.svg", "trend-study.svg"]);
    const sheet = readFileSync(join(output, "review.html"), "utf8");
    assert.equal(sheet.match(/<img /g)?.length, 18);
    assert.throws(() => run("build", spec, "--out", output), /new draft directory/);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("checks existing icons and catches motion outside the reduced-motion guard", () => {
  const file = (suffix: string) => readFileSync(new URL(`../../icons/coffee${suffix}.svg`, import.meta.url), "utf8");
  const files = { original: file(""), minimalist: file("-minimalist"), animated: file("-animated") };
  checkFamily("coffee", files);
  assert.throws(() => checkFamily("coffee", { ...files, animated: files.animated.replace("prefers-reduced-motion: no-preference", "prefers-color-scheme: dark") }), /Motion needs/);
  assert.throws(() => checkFamily("coffee", { ...files, minimalist: files.original }), /identical/);
});
