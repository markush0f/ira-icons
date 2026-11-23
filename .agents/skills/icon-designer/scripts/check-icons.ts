import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { checkFamily, reviewSheet, validName, variants } from "../../../../scripts/icon-studio/review.ts";

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { sheet: { type: "string" }, directory: { type: "string" } },
  });
  const [name] = positionals;
  if (positionals.length !== 1 || !validName(name)) throw new Error("Usage: node check-icons.ts NAME [--directory DIR] [--sheet FILE]");
  const directory = values.directory ?? fileURLToPath(new URL("../../../../icons/", import.meta.url));
  const files = Object.fromEntries(await Promise.all(variants.map(async ([key, , suffix]) => [
    key, await readFile(join(directory, `${name}${suffix}.svg`), "utf8"),
  ])));
  checkFamily(name, files);
  console.log(`Checked ${name} (3 SVGs).`);
  if (values.sheet) {
    await writeFile(values.sheet, reviewSheet(name, files));
    console.log(`Review sheet: ${values.sheet}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
