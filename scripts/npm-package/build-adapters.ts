import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import ts from 'typescript';
import { isAnimatedIcon, scaleAnimationSvg } from './shared/animation-speed.ts';

interface IconComponent { file: string; name: string; identifier: string }

function parseSvg(source: string, file: string) {
  const match = source.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);
  if (!match) throw new Error(`Invalid SVG document: ${file}`);
  const attributes: Record<string, string> = {};
  const remaining = match[1].replace(/\s+([\w:-]+)="([^"]*)"/g, (_: string, name: string, value: string) => {
    attributes[name] = value;
    return '';
  });
  if (remaining.trim()) throw new Error(`Unsupported SVG root attributes: ${file}`);
  return { attributes, markup: match[2].trim() };
}

export async function buildVueAndSvelte({ output, components, iconDirectory }: { output: string; components: IconComponent[]; iconDirectory: string }) {
  await Promise.all(['vue/icons', 'svelte/icons', 'shared/icons'].map(
    (directory) => mkdir(join(output, directory), { recursive: true }),
  ));

  const write = (path: string, contents: string) => writeFile(join(output, path), contents);
  const copy = (path: string) => copyFile(new URL(path, import.meta.url), join(output, path));
  const compileRuntime = async (path: string) => {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    await write(path.replace(/\.ts$/, '.js'), outputText.replaceAll('icon-props.ts', 'icon-props.js').replaceAll('animation-speed.ts', 'animation-speed.js'));
  };
  const imports = components.map(({ name, identifier }) =>
    `import ${identifier} from './icons/${name}.js';`).join('\n');
  const entries = components.map(({ name, identifier }) =>
    `  ${JSON.stringify(name)}: ${identifier},`).join('\n');
  const namedExports = (extension: string) => components.map(({ name, identifier }) =>
    `export { default as ${identifier} } from './icons/${name}.${extension}';\n`).join('');
  // Every individual icon in a framework has the same props. Share its type
  // declaration instead of shipping 30,000 identical files to npm.
  const namedTypes = components.map(({ identifier }) =>
    `export { default as ${identifier} } from './IndividualIcon.js';\n`).join('');

  await Promise.all([
    ...['shared/icon-props.ts', 'shared/animation-speed.ts', 'vue/create-icon.ts'].map(compileRuntime),
    ...['vue/types.d.ts', 'svelte/Glyph.svelte', 'svelte/types.d.ts'].map(copy),
    write('shared/catalog.js', `${imports}

export default Object.assign(Object.create(null), {
${entries}
});
`),
    write('vue/index.js', `import catalog from '../shared/catalog.js';
import { requireIcon } from '../shared/icon-props.js';
import { createIcon } from './create-icon.js';

export const Icon = createIcon(
  { name: 'IraIcon', props: { name: { type: String, required: true } } },
  ({ name }) => requireIcon(catalog, name),
);
export default Icon;
${namedExports('js')}`),
    write('vue/index.d.ts', `import type { DefineComponent } from 'vue';
import type { IconProps } from './types.js';
export type { IconProps, IndividualIconProps } from './types.js';
export declare const Icon: DefineComponent<IconProps>;
export default Icon;
${namedTypes}`),
    write('vue/IndividualIcon.d.ts', `import type { DefineComponent } from 'vue';
import type { IndividualIconProps } from './types.js';
declare const Icon: DefineComponent<IndividualIconProps>;
export default Icon;
`),
    write('svelte/IndividualIcon.d.ts', `import type { Component } from 'svelte';
import type { IndividualIconProps } from './types.js';
declare const Icon: Component<IndividualIconProps>;
export default Icon;
`),
    write('svelte/Icon.svelte', `<script lang="ts">
  import catalog from '../shared/catalog.js';
  import { requireIcon } from '../shared/icon-props.js';
  import Glyph from './Glyph.svelte';
  import type { IconProps } from './types.js';

  let { name, ...props }: IconProps = $props();
  let icon = $derived(requireIcon(catalog, name));
</script>

<Glyph {icon} {...props} />
`),
    write('svelte/index.js', `export { default, default as Icon } from './Icon.svelte';
${namedExports('svelte')}`),
    write('svelte/index.d.ts', `export type { IconProps, IndividualIconProps } from './types.js';
export { default, default as Icon } from './Icon.svelte';
${namedTypes}`),
    write('svelte/Icon.svelte.d.ts', `import type { Component } from 'svelte';
import type { IconProps } from './types.js';
declare const Icon: Component<IconProps>;
export default Icon;
`),
    ...components.map(async ({ file, name, identifier }) => {
      const animated = isAnimatedIcon(name);
      const source = await readFile(join(iconDirectory, file), 'utf8');
      const icon = { ...parseSvg(animated ? scaleAnimationSvg(source) : source, file), animated };
      await Promise.all([
        write(`shared/icons/${name}.js`, `export default ${JSON.stringify(icon)};\n`),
        write(`vue/icons/${name}.js`, `import icon from '../../shared/icons/${name}.js';
import { createIcon } from '../create-icon.js';
export default /* @__PURE__ */ createIcon({ name: '${identifier}' }, () => icon);
`),
        write(`svelte/icons/${name}.svelte`, `<script lang="ts">
  import icon from '../../shared/icons/${name}.js';
  import Glyph from '../Glyph.svelte';
  import type { IndividualIconProps } from '../types.js';

  let props: IndividualIconProps = $props();
</script>

<Glyph {icon} {...props} />
`),
      ]);
    }),
  ]);
}
