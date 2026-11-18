import { readdir, readFile, writeFile } from 'node:fs/promises';

const sourceDir = new URL('../icons/', import.meta.url);
const outputFile = new URL('../packages/astro/icons.generated.mjs', import.meta.url);
const filenames = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
  .map((entry) => entry.name)
  .sort();

const entries = await Promise.all(filenames.map(async (filename) => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.svg$/.test(filename)) {
    throw new Error(`Nombre de icono no válido: ${filename}`);
  }

  const svg = (await readFile(new URL(filename, sourceDir), 'utf8')).trim();
  const root = /^<svg\s+([^>]+)>([\s\S]*)<\/svg>$/.exec(svg);
  if (!root) throw new Error(`Se esperaba un SVG con un elemento raíz en ${filename}`);

  const [, rootAttributes, shapes] = root;
  const attributePattern = /(?:^|\s+)([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  if (rootAttributes.replace(attributePattern, '').trim()) {
    throw new Error(`Atributos SVG no válidos en ${filename}`);
  }
  const attributes = Object.fromEntries([...rootAttributes.matchAll(attributePattern)]
    .filter(([, name]) => name !== 'width' && name !== 'height')
    .map(([, name, doubleQuoted, singleQuoted]) => [name, doubleQuoted ?? singleQuoted]));

  return [filename.slice(0, -4), { attributes, shapes: shapes.trim() }];
}));

const source = `// Generado desde icons/. No editar a mano.
const icons = ${JSON.stringify(Object.fromEntries(entries), null, 2)};

export const iconNames = Object.freeze(Object.keys(icons));

export function getIcon(name) {
  return typeof name === 'string' && Object.hasOwn(icons, name) ? icons[name] : undefined;
}
`;

await writeFile(outputFile, source);
console.log(`Registro Astro generado: ${entries.length} iconos.`);
