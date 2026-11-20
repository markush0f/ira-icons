import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import svgr from 'vite-plugin-svgr';
import { buildVueAndSvelte } from '../../scripts/npm-package/build-adapters.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = join(root, 'dist/npm');
const directories = ['astro', 'react', 'vue', 'svelte', 'icons', 'shared'];
const iconDirectory = join(root, 'icons');
const icons = (await readdir(iconDirectory)).filter((file) => file.endsWith('.svg')).sort();
const components = icons.map((file) => {
  const name = file.slice(0, -4);
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid icon filename: ${file}`);
  const identifier = name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
  if (identifier === 'Icon') throw new Error(`Reserved component name: ${identifier}`);
  return { file, name, identifier };
});
if (new Set(components.map(({ identifier }) => identifier)).size !== components.length) {
  throw new Error('Duplicate icon component names');
}

// Recreate only generated package directories so removed icons cannot ship by accident.
for (const dir of directories) {
  await rm(join(output, dir), { recursive: true, force: true });
  await mkdir(join(output, dir), { recursive: true });
}

const entry = 'virtual:ira-react';
const individualEntries = new Map(components.map((icon) => [`${entry}/${icon.name}`, icon]));
const virtualEntries = {
  name: 'ira-package-entries',
  resolveId(id) {
    if (id === entry || individualEntries.has(id)) return `\0${id}`;
  },
  load(id) {
    if (id === `\0${entry}`) return [
      `export { default, Icon } from ${JSON.stringify(join(root, 'packages/react/Icon.jsx'))};`,
      ...components.map(({ name, identifier }) => `export { default as ${identifier} } from ${JSON.stringify(`${entry}/${name}`)};`),
    ].join('\n');
    const icon = individualEntries.get(id.slice(1));
    if (!icon || !id.startsWith('\0')) return;
    return `
import { createElement, forwardRef } from 'react';
import Svg from ${JSON.stringify(`${join(root, 'icons', icon.file)}?react`)};
export default /* @__PURE__ */ forwardRef(function ${icon.identifier}(
  { size = 24, color = 'currentColor', label, ...props }, ref
) {
  const ariaLabel = props['aria-label'] || (typeof label === 'string' ? label.trim() : '');
  const labelled = Boolean(ariaLabel || props['aria-labelledby']);
  return createElement(Svg, {
    width: size, height: size, color, role: labelled ? 'img' : undefined,
    'aria-hidden': labelled ? undefined : true, focusable: false,
    ...props, 'aria-label': ariaLabel || undefined, ref,
  });
});`;
  },
};

await build({
  root,
  configFile: false,
  plugins: [virtualEntries, svgr({ svgrOptions: { ref: true } })],
  build: {
    outDir: join(output, 'react'),
    lib: {
      entry,
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    rollupOptions: {
      input: { index: entry, ...Object.fromEntries(components.map(({ name }) => [`icons/${name}`, `${entry}/${name}`])) },
      external: /^react(?:\/|$)/,
    },
  },
});

// Native Astro SVG imports must be processed by the consumer's Astro compiler.
// Generate explicit imports rather than requiring a glob to run inside node_modules.
const imports = icons.map((file, index) => `import Svg${index} from ${JSON.stringify(`../icons/${file}`)};`);
const entries = icons.map((file, index) => `  ${JSON.stringify(file.slice(0, -4))}: Svg${index},`);
const astroSource = await readFile(join(root, 'packages/astro/Icon.astro'), 'utf8');
const adapterImport = /^import \{ getIcon \} from ['"]\.\/icons\.mjs['"];$/m;
if (!adapterImport.test(astroSource)) throw new Error('Could not locate the Astro adapter catalog import.');
const astro = astroSource.replace(adapterImport, () => [
  ...imports,
  'const icons = Object.assign(Object.create(null), {',
  ...entries,
  '});',
  'const getIcon = (name) => icons[name];',
].join('\n'));

await mkdir(join(output, 'astro/icons'), { recursive: true });
const individualTypes = `import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { IconProps } from '../Icon.js';
export type { IndividualIconProps as IconProps } from '../Icon.js';
declare const Icon: ForwardRefExoticComponent<Omit<IconProps, 'name' | 'ref'> & RefAttributes<SVGSVGElement>>;
export default Icon;
`;
const genericTypes = await readFile(join(root, 'packages/react/Icon.d.ts'), 'utf8');
const reactTypes = `${genericTypes}\nexport type IndividualIconProps = Omit<IconProps, 'name'>;\n` + components
  .map(({ name, identifier }) => `export { default as ${identifier} } from './icons/${name}.js';`)
  .join('\n') + '\n';

await Promise.all([
  writeFile(join(output, 'astro/Icon.astro'), astro),
  ...components.flatMap(({ name, file }) => [
    writeFile(join(output, 'react/icons', `${name}.d.ts`), individualTypes),
    writeFile(join(output, 'astro/icons', `${name}.astro`), `---
import Svg from ${JSON.stringify(`../../icons/${file}`)};
const { size = 24, color = 'currentColor', label, ...props } = Astro.props;
const ariaLabel = props['aria-label'] || (typeof label === 'string' ? label.trim() : '');
const labelled = Boolean(ariaLabel || props['aria-labelledby']);
---
<Svg width={size} height={size} color={color} role={labelled ? 'img' : undefined} aria-hidden={labelled ? undefined : 'true'} {...props} aria-label={ariaLabel || undefined} />
`),
  ]),
  writeFile(join(output, 'react/Icon.d.ts'), reactTypes),
  copyFile(join(root, 'scripts/npm-package/package.json'), join(output, 'package.json')),
  copyFile(join(root, 'scripts/npm-package/README.md'), join(output, 'README.md')),
  ...icons.map((file) => copyFile(join(iconDirectory, file), join(output, 'icons', file))),
  buildVueAndSvelte({ output, components, iconDirectory }),
]);

console.log(`Built ${icons.length} SVGs and four adapters in dist/npm/`);
