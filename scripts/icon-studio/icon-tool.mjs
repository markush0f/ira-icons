import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs, promisify } from "node:util";
import { findRelatedIconNames, requestIconProposal } from "../../web/src/server/generate-icon.mjs";
import { compileIcon } from "../../web/src/server/icon-svg.mjs";
import { checkFamily, reviewSheet, validName, variants } from "./review.mjs";

const run = promisify(execFile);
const catalog = fileURLToPath(new URL("../../icons/", import.meta.url));

async function audit(browser, files) {
  const directory = await mkdtemp(join(tmpdir(), "ira-icon-audit-"));
  try {
    const probe = await readFile(new URL("./geometry-probe.html", import.meta.url), "utf8");
    const page = join(directory, "geometry.html");
    await writeFile(page, "<!doctype html>" + variants.map(([key, , suffix]) =>
      `<section data-file="draft${suffix}.svg">${files[key]}</section>`
    ).join("") + probe);
    const { stdout, stderr } = await run(browser, [
      "--headless", "--disable-gpu", "--disable-background-networking", "--no-first-run",
      `--user-data-dir=${join(directory, "profile")}`, "--enable-logging=stderr", "--dump-dom", pathToFileURL(page).href,
    ], { timeout: 25_000, maxBuffer: 256_000 });
    if (/attribute d:/.test(stderr)) throw new Error("Chrome rejected SVG path data");
    const verdict = /<output id="geometry-result">([^<]*)<\/output>/.exec(stdout)?.[1];
    if (verdict !== "pass") throw new Error(`Browser audit: ${verdict || "no verdict"}`);
    console.log("Browser audit passed.");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function destination(path) {
  const absolute = resolve(path);
  const output = join(await realpath(dirname(absolute)), basename(absolute));
  const delta = relative(await realpath(catalog), output);
  if (delta === "" || (!isAbsolute(delta) && delta !== ".." && !delta.startsWith(".." + sep))) {
    throw new Error("--out must be outside icons/");
  }
  const info = await stat(output).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  if (info) throw new Error("--out must be a new draft directory");
  return output;
}

async function writeDraft(name, proposal, output, browser, saveProposal) {
  const files = compileIcon(proposal, name);
  checkFamily(name, files);
  if (browser) await audit(browser, files);
  // Exclusive creation: a concurrent process cannot cause us to overwrite a draft.
  await mkdir(output);
  await Promise.all([
    ...variants.map(([key, , suffix]) => writeFile(join(output, `${name}${suffix}.svg`), files[key], { flag: "wx" })),
    writeFile(join(output, "review.html"), reviewSheet(name, files), { flag: "wx" }),
    ...(saveProposal ? [writeFile(join(output, "proposal.json"), JSON.stringify({ name, ...proposal }, null, 2) + "\n", { flag: "wx" })] : []),
  ]);
  console.log(`Draft: ${output}\nReview: ${join(output, "review.html")}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "--help" || !command) {
    console.log("Usage: icon-tool.mjs search QUERY [--limit 6] | build SPEC --out DIR [--browser CHROME] | generate DESCRIPTION --name NAME --out DIR [--browser CHROME]");
    return;
  }
  const options = command === "search" ? { limit: { type: "string", default: "6" } } : {
    out: { type: "string" }, browser: { type: "string" }, ...(command === "generate" && { name: { type: "string" } }),
  };
  const { positionals, values } = parseArgs({ args, allowPositionals: true, options });
  const [input] = positionals;
  if (positionals.length !== 1 || !input.trim()) throw new Error("Pass exactly one query, spec file, or description");
  const iconNames = (await readdir(catalog)).filter((file) => file.endsWith(".svg")).map((file) => file.slice(0, -4));
  if (command === "search") {
    const limit = Number(values.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error("--limit must be between 1 and 20");
    const names = findRelatedIconNames(input, iconNames, limit);
    for (const name of names) console.log(`${name}\ticons/${name}.svg`);
    if (!names.length) console.log("No matches. Try a synonym or a related shape.");
    return;
  }
  if (!["build", "generate"].includes(command) || !values.out) throw new Error("Use build or generate with --out");
  const output = await destination(values.out);
  let name, proposal;
  if (command === "build") {
    if ((await stat(input)).size > 32_768) throw new Error("Specification is larger than 32 KiB");
    ({ name, ...proposal } = JSON.parse(await readFile(input, "utf8")));
  } else {
    name = values.name;
    if (input.trim().length > 500) throw new Error("Description must have at most 500 characters");
  }
  if (!validName(name) || name.length > 64 || variants.some(([, , suffix]) => iconNames.includes(name + suffix))) {
    throw new Error("Choose an unused lowercase kebab-case name without a style suffix");
  }
  if (command === "generate") {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new Error("Set GEMINI_API_KEY in the environment before generating an icon");
    const designGuide = await readFile(new URL("../../.agents/skills/icon-designer/references/design-guide.md", import.meta.url), "utf8");
    proposal = await requestIconProposal({ description: input.trim(), style: "original" }, key, {
      iconNames,
      designGuide,
      readReference: (reference) => iconNames.includes(reference)
        ? readFile(join(catalog, `${reference}.svg`), "utf8")
        : undefined,
    });
  }
  await writeDraft(name, proposal, output, values.browser, command === "generate");
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
