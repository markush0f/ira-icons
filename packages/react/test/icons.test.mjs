import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';
import { build, createServer } from 'vite';
import svgr from 'vite-plugin-svgr';

// Use the same SVG import pipeline as a consuming React/Vite project.
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  plugins: [svgr({ svgrOptions: { ref: true } })],
  resolve: { dedupe: ['react', 'react-dom'] },
  ssr: { noExternal: ['@ira-icons/react'] },
});
after(() => server.close());
const { default: Icon, Icon: NamedIcon } = await server.ssrLoadModule('@ira-icons/react');
const { iconNames, getIcon } = await server.ssrLoadModule('@ira-icons/react/names');
const render = (props) => renderToStaticMarkup(createElement(Icon, props));

test('discovers the complete, sorted source catalog through Vite', async () => {
  const files = await readdir(new URL('../../../icons/', import.meta.url));
  assert.deepEqual(iconNames, files.filter((file) => file.endsWith('.svg')).map((file) => file.slice(0, -4)).sort());
  assert.ok(Object.isFrozen(iconNames));
  assert.equal(Icon, NamedIcon);
  assert.ok(getIcon('search'));
  assert.equal(getIcon('missing'), undefined);
});

test('renders every original SVG with its geometry and text', async () => {
  for (const name of iconNames) {
    const source = await readFile(new URL(`../../../icons/${name}.svg`, import.meta.url), 'utf8');
    const rendered = render({ name });
    for (const [, attribute] of source.matchAll(/\b(?:d|cx|cy|r|rx|ry|x|y|viewBox)="([^"]*)"/g)) {
      const normalized = attribute.trim() !== '' && Number.isFinite(Number(attribute))
        ? String(Number(attribute))
        : attribute;
      assert.ok(rendered.includes(`="${normalized}"`), `${name}: ${attribute}`);
    }
    assert.match(rendered, /^<svg /);
  }
  assert.match(render({ name: 'svg' }), />SVG<\/text>/);
});

test('supports defaults and standard SVG props', () => {
  const html = render({ name: 'search', size: 32, color: '#6339b8', className: 'icon', strokeWidth: 1, 'data-testid': 'search', style: { opacity: 0.5 } });
  for (const part of ['width="32"', 'height="32"', 'color="#6339b8"', 'class="icon"', 'stroke-width="1"', 'data-testid="search"', 'opacity:0.5', 'aria-hidden="true"']) {
    assert.ok(html.includes(part), part);
  }
  assert.match(render({ name: 'search' }), /color="currentColor"/);
  assert.match(render({ name: 'search', size: '1em', width: 40 }), /width="40" height="1em"/);
});

test('handles accessible labels and decorative icons', () => {
  const labelled = render({ name: 'search', label: ' Search ' });
  assert.match(labelled, /role="img"/);
  assert.match(labelled, /aria-label="Search"/);
  assert.doesNotMatch(labelled, /aria-hidden/);
  assert.match(render({ name: 'search', label: '   ' }), /aria-hidden="true"/);
  assert.match(render({ name: 'search', 'aria-label': 'Find' }), /role="img"/);
  assert.match(render({ name: 'search', 'aria-labelledby': 'title' }), /role="img"/);
  assert.doesNotMatch(render({ name: 'search', 'aria-labelledby': 'title' }), /aria-hidden/);
});

test('bundles a React application for the browser without code generation', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [svgr({ svgrOptions: { ref: true } })],
    resolve: { dedupe: ['react', 'react-dom'] },
    build: {
      write: false,
      rollupOptions: { input: fileURLToPath(new URL('./fixture.jsx', import.meta.url)) },
    },
  });
  assert.ok(result.output.some((asset) => asset.type === 'chunk' && asset.code.includes('Unknown Ira Icons icon')));
});

test('escapes labels and rejects unknown names', () => {
  assert.match(render({ name: 'search', label: '<script>' }), /aria-label="&lt;script&gt;"/);
  for (const name of ['missing', 'toString', '__proto__', undefined]) {
    assert.throws(() => render({ name }), /Unknown Ira Icons icon:/);
  }
});
