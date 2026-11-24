import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createSSRApp, h, type Component as VueComponent } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import type { Component as SvelteComponent } from 'svelte';

const variants = new URL('../../dist/npm-variants/', import.meta.url);
const complete = new URL('all/', variants);
const resolveFrom = (directory: URL, specifier: string) => createRequire(new URL('package.json', directory)).resolve(specifier);
const importExport = (directory: URL, specifier: string) => import(pathToFileURL(resolveFrom(directory, specifier)).href);

for (const [framework, files] of Object.entries({ react: ['react'], astro: ['astro', 'icons'], vue: ['vue', 'shared'], svelte: ['svelte', 'shared'] })) {
  test(`${framework} package ships only its own framework and required assets`, () => {
    const directory = new URL(`${framework}/`, variants);
    const manifest = JSON.parse(readFileSync(new URL('package.json', directory), 'utf8'));
    assert.deepEqual(Object.keys(manifest.peerDependencies), [framework]);
    assert.equal(manifest.license, 'MIT');
    assert.equal(manifest.publishConfig.access, 'public');
    assert.match(readFileSync(new URL('LICENSE', directory), 'utf8'), /MIT License/);
    assert.match(readFileSync(new URL('LICENSE.tabler', directory), 'utf8'), /Paweł Kuna/);
    assert.deepEqual(readdirSync(directory).sort(), [...files, 'LICENSE', 'LICENSE.tabler', 'README.md', 'package.json'].sort());
    assert.ok(resolveFrom(directory, `${manifest.name}/search-minimalist`));
    assert.ok(resolveFrom(complete, `@ira-icons/iraicons/${framework}/search-minimalist`));
    assert.ok(resolveFrom(new URL('../../dist/npm/', import.meta.url), `@markusss0s/ira-library/${framework}/search-minimalist`));
  });
}

// The package ships Svelte source; emulate the consumer's SSR compilation.
const registerSvelteCompiler = () => registerHooks({
  load(url, context, next) {
    if (!url.startsWith(variants.href) || !url.endsWith('.svelte')) return next(url, context);
    const filename = fileURLToPath(url);
    const { js, warnings } = compile(readFileSync(filename, 'utf8'), { filename, generate: 'server' });
    assert.deepEqual(warnings, [], filename);
    return { format: 'module', source: js.code, shortCircuit: true };
  },
});

const adapters: Record<string, (component: unknown, props: Record<string, unknown>) => string | Promise<string>> = {
  react: (component, { class: className, ...props }) => renderToStaticMarkup(createElement(component as ComponentType<Record<string, unknown>>, { ...props, className })),
  vue: (component, props) => renderToString(createSSRApp({ render: () => h(component as VueComponent, props) })),
  svelte: (component, props) => render(component as SvelteComponent<Record<string, unknown>>, { props }).body,
};

for (const [adapter, renderIcon] of Object.entries(adapters)) {
  test(`${adapter} exports named, individual, and dynamic icons with accessible SVG`, async (t) => {
    if (adapter === 'svelte') {
      const hooks = registerSvelteCompiler();
      t.after(() => hooks.deregister());
    }
    const directory = new URL(`${adapter}/`, variants);
    const name = `@ira-icons/iraicons-${adapter}`;
    const icons = await importExport(directory, name);
    const individual = (await importExport(directory, `${name}/search-minimalist`)).default;
    assert.equal(individual, icons.SearchMinimalist);
    assert.equal(icons.default, icons.Icon);

    const labelled = await renderIcon(individual, { size: 28, color: '#663399', label: 'Search & find', class: 'search-icon' });
    for (const attr of ['width="28"', 'height="28"', 'color="#663399"', 'role="img"', 'aria-label="Search &amp; find"', 'class="search-icon"']) {
      assert.ok(labelled.includes(attr), labelled);
    }
    assert.doesNotMatch(labelled, /aria-hidden/);
    assert.match(await renderIcon(icons.Svg, {}), />SVG<\/text>/);

    const animated = await renderIcon(icons.Icon, { name: 'coffee-animated', speed: 1.5 });
    assert.match(animated, /viewBox="0 0 24 24"/);
    assert.match(animated, /aria-hidden="true"/);
    assert.match(animated, /@keyframes ira-stroke-coffee-0/);
    assert.match(animated, /prefers-reduced-motion: no-preference/);
    assert.match(animated, /--ira-icon-speed:\s*1\.5/);
    assert.match(animated, /calc\(2\.65s \/ var\(--ira-icon-speed, 1\)\)/);
    assert.doesNotMatch(animated, / speed=/);
    assert.match(await renderIcon(icons.CoffeeAnimated, { speed: 2 }), /--ira-icon-speed:\s*2/);
    assert.doesNotMatch(await renderIcon(icons.Coffee, { speed: 2 }), /--ira-icon-speed| speed=/);
  });
}
