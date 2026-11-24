import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, type Plugin } from 'vite';
import { reactSvgPlugin } from './react/svg-plugin.ts';
import { scaleAnimationSvg } from './shared/animation-speed.ts';
import { buildVueAndSvelte } from './build-adapters.ts';
import { writePackageVariants } from './package-variants.ts';

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
const virtualEntries: Plugin = {
  name: 'ira-package-entries',
  resolveId(id) {
    if (id === entry || individualEntries.has(id)) return `\0${id}`;
  },
  load(id) {
    if (id === `\0${entry}`) return [
      `export { default, Icon } from ${JSON.stringify(fileURLToPath(new URL('./react/Icon.tsx', import.meta.url)))};`,
      ...components.map(({ name, identifier }) => `export { default as ${identifier} } from ${JSON.stringify(`${entry}/${name}`)};`),
    ].join('\n');
    const icon = individualEntries.get(id.slice(1));
    if (!icon || !id.startsWith('\0')) return;
    return `
import { createElement, forwardRef } from 'react';
import $Svg from ${JSON.stringify(`${join(root, 'icons', icon.file)}?react`)};
import { motionVars } from ${JSON.stringify(fileURLToPath(new URL('./shared/animation-speed.ts', import.meta.url)))};
export default /* @__PURE__ */ forwardRef(function ${icon.identifier}(
  { size = 24, color = 'currentColor', label, speed, constant, ...props }, ref
) {
  const ariaLabel = props['aria-label'] || (typeof label === 'string' ? label.trim() : '');
  const labelled = Boolean(ariaLabel || props['aria-labelledby']);
  return createElement($Svg, {
    width: size, height: size, color, role: labelled ? 'img' : undefined,
    'aria-hidden': labelled ? undefined : true, focusable: false,
    ...props, ${icon.name.endsWith('-animated') ? 'style: { ...props.style, ...motionVars(speed, constant) },' : ''} 'aria-label': ariaLabel || undefined, ref,
  });
});`;
  },
};

await build({
  root,
  configFile: false,
  plugins: [virtualEntries, reactSvgPlugin()],
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
const astroCatalog = [
  ...imports,
  'const icons = Object.assign(Object.create(null), {',
  ...entries,
  '});',
  'export const getIcon = (name) => icons[name];',
  '',
].join('\n');

await mkdir(join(output, 'astro/icons'), { recursive: true });
const individualTypes = `import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { IconProps } from '../Icon.js';
export type { IndividualIconProps as IconProps } from '../Icon.js';
declare const Icon: ForwardRefExoticComponent<Omit<IconProps, 'name' | 'ref'> & RefAttributes<SVGSVGElement>>;
export default Icon;
`;
const genericTypes = await readFile(new URL('./react/Icon.types.d.ts', import.meta.url), 'utf8');
const reactTypes = `${genericTypes}\nexport type IndividualIconProps = Omit<IconProps, 'name'>;\n` + components
  .map(({ name, identifier }) => `export { default as ${identifier} } from './icons/${name}.js';`)
  .join('\n') + '\n';

await Promise.all([
  // Published packages use native Astro SVG component imports.
  copyFile(new URL('./astro/Icon.astro', import.meta.url), join(output, 'astro/Icon.astro')),
  copyFile(new URL('./shared/animation-speed.ts', import.meta.url), join(output, 'astro/animation-speed.ts')),
  writeFile(join(output, 'astro/icons.mjs'), astroCatalog),
  ...components.flatMap(({ name, file }) => [
    writeFile(join(output, 'react/icons', `${name}.d.ts`), individualTypes),
    writeFile(join(output, 'astro/icons', `${name}.astro`), `---
import Svg from ${JSON.stringify(`../../icons/${file}`)};
import { speedStyle } from '../animation-speed.ts';
const { size = 24, color = 'currentColor', label, speed, constant, style, ...props } = Astro.props;
const ariaLabel = props['aria-label'] || (typeof label === 'string' ? label.trim() : '');
const labelled = Boolean(ariaLabel || props['aria-labelledby']);
---
<Svg width={size} height={size} color={color} role={labelled ? 'img' : undefined} aria-hidden={labelled ? undefined : 'true'} {...props} style={speedStyle(${name.endsWith('-animated')}, speed, style, constant)} aria-label={ariaLabel || undefined} />
`),
  ]),
  writeFile(join(output, 'react/Icon.d.ts'), reactTypes),
  copyFile(new URL('../icon-expansion/folio/TABLER-LICENSE.txt', import.meta.url), join(output, 'LICENSE.tabler')),
  copyFile(new URL('../../LICENSE', import.meta.url), join(output, 'LICENSE')),
  writeFile(join(output, 'package.json'), JSON.stringify({
    ...JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8')),
    name: '@markusss0s/ira-library',
  }, null, 2) + '\n'),
  copyFile(new URL('./README.md', import.meta.url), join(output, 'README.md')),
  ...icons.map(async (file) => {
    const source = join(iconDirectory, file), destination = join(output, 'icons', file);
    if (file.endsWith('-animated.svg')) await writeFile(destination, scaleAnimationSvg(await readFile(source, 'utf8')));
    else await copyFile(source, destination);
  }),
  buildVueAndSvelte({ output, components, iconDirectory }),
]);

const manifest = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
await writePackageVariants(output, join(root, 'dist/npm-variants'), manifest);
console.log(`Built ${icons.length} SVGs, the complete and standalone packages, and the legacy package.`);
