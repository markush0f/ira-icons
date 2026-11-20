import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const templates = fileURLToPath(new URL('./adapters/', import.meta.url));

function parseSvg(source, file) {
  const match = source.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/);
  if (!match) throw new Error(`Invalid SVG document: ${file}`);
  const attributes = {};
  const remaining = match[1].replace(/\s+([\w:-]+)="([^"]*)"/g, (_, name, value) => {
    attributes[name] = value;
    return '';
  });
  if (remaining.trim()) throw new Error(`Unsupported SVG root attributes: ${file}`);
  return { attributes, markup: match[2].trim() };
}

export async function buildVueAndSvelte({ output, components, iconDirectory }) {
  await Promise.all(['vue/icons', 'svelte/icons', 'shared/icons'].map(
    (directory) => mkdir(join(output, directory), { recursive: true }),
  ));

  const write = (path, contents) => writeFile(join(output, path), contents);
  const copy = (path) => copyFile(join(templates, path), join(output, path));
  const imports = components.map(({ name, identifier }) =>
    `import ${identifier} from './icons/${name}.js';`).join('\n');
  const entries = components.map(({ name, identifier }) =>
    `  ${JSON.stringify(name)}: ${identifier},`).join('\n');
  const namedExports = (extension) => components.map(({ name, identifier }) =>
    `export { default as ${identifier} } from './icons/${name}.${extension}';\n`).join('');

  await Promise.all([
    ...['shared/icon-props.js', 'vue/create-icon.js', 'vue/types.d.ts', 'svelte/Glyph.svelte', 'svelte/types.d.ts'].map(copy),
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
${namedExports('js')}`),
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
${namedExports('svelte')}`),
    write('svelte/Icon.svelte.d.ts', `import type { Component } from 'svelte';
import type { IconProps } from './types.js';
declare const Icon: Component<IconProps>;
export default Icon;
`),
    ...components.map(async ({ file, name, identifier }) => {
      const icon = parseSvg(await readFile(join(iconDirectory, file), 'utf8'), file);
      await Promise.all([
        write(`shared/icons/${name}.js`, `export default ${JSON.stringify(icon)};\n`),
        write(`vue/icons/${name}.js`, `import icon from '../../shared/icons/${name}.js';
import { createIcon } from '../create-icon.js';
export default /* @__PURE__ */ createIcon({ name: '${identifier}' }, () => icon);
`),
        write(`vue/icons/${name}.d.ts`, `import type { DefineComponent } from 'vue';
import type { IndividualIconProps } from '../types.js';
declare const Icon: DefineComponent<IndividualIconProps>;
export default Icon;
`),
        write(`svelte/icons/${name}.svelte`, `<script lang="ts">
  import icon from '../../shared/icons/${name}.js';
  import Glyph from '../Glyph.svelte';
  import type { IndividualIconProps } from '../types.js';

  let props: IndividualIconProps = $props();
</script>

<Glyph {icon} {...props} />
`),
        write(`svelte/icons/${name}.svelte.d.ts`, `import type { Component } from 'svelte';
import type { IndividualIconProps } from '../types.js';
declare const Icon: Component<IndividualIconProps>;
export default Icon;
`),
      ]);
    }),
  ]);
}
