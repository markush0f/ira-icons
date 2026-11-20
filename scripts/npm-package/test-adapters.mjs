import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';

const distribution = new URL('../../dist/npm/', import.meta.url);
const resolve = createRequire(new URL('package.json', distribution)).resolve;
const importExport = (subpath) =>
  import(pathToFileURL(resolve(`@markusss0s/ira-library/${subpath}`)).href);

// The package ships Svelte source; emulate the consumer's SSR compilation.
registerHooks({
  load(url, context, next) {
    if (!url.startsWith(distribution.href) || !url.endsWith('.svelte')) return next(url, context);
    const filename = fileURLToPath(url);
    const { js, warnings } = compile(readFileSync(filename, 'utf8'), { filename, generate: 'server' });
    assert.deepEqual(warnings, [], filename);
    return { format: 'module', source: js.code, shortCircuit: true };
  },
});

const adapters = {
  vue: (component, props) => renderToString(createSSRApp({ render: () => h(component, props) })),
  svelte: (component, props) => render(component, { props }).body,
};

for (const [adapter, renderIcon] of Object.entries(adapters)) {
  test(`${adapter} exports named, individual, and dynamic icons with accessible SVG`, async () => {
    const icons = await importExport(adapter);
    const individual = (await importExport(`${adapter}/search-minimalist`)).default;
    assert.equal(individual, icons.SearchMinimalist);
    assert.equal(icons.default, icons.Icon);

    const labelled = await renderIcon(individual, { size: 28, color: '#663399', label: 'Search & find', class: 'search-icon' });
    for (const attr of ['width="28"', 'height="28"', 'color="#663399"', 'role="img"', 'aria-label="Search &amp; find"', 'class="search-icon"']) {
      assert.ok(labelled.includes(attr), labelled);
    }
    assert.doesNotMatch(labelled, /aria-hidden/);
    assert.match(await renderIcon(icons.Svg, {}), />SVG<\/text>/);

    const animated = await renderIcon(icons.Icon, { name: 'coffee-animated' });
    assert.match(animated, /viewBox="0 0 24 24"/);
    assert.match(animated, /aria-hidden="true"/);
    assert.match(animated, /@keyframes ira-coffee-steam/);
    assert.match(animated, /prefers-reduced-motion: no-preference/);
  });
}
