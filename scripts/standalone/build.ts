import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';

const htmlFile = new URL('../../index.html', import.meta.url);
const html = await readFile(htmlFile, 'utf8');
const source = await readFile(new URL('./catalog.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
});
const start = '    // Generated from scripts/standalone/catalog.ts. Do not edit this block.';
const end = '    // End generated standalone script.';
const pattern = /    \/\/ Generated from scripts\/standalone\/catalog\.ts\. Do not edit this block\.[\s\S]*?    \/\/ End generated standalone script\./;
if (!pattern.test(html)) throw new Error('Missing generated standalone script markers');
const block = `${start}\n${outputText.trimEnd().replace(/^/gm, '    ')}\n${end}`;
const next = html.replace(pattern, block);
if (process.argv.includes('--check')) {
  if (html !== next) throw new Error('Standalone preview is out of date. Run bun run build:standalone.');
} else if (html !== next) {
  await writeFile(htmlFile, next);
}
