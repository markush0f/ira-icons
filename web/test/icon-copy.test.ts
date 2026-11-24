import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatIcon, type CodeFormat } from '../src/scripts/icon-copy.ts';

function element(localName: string, attrs: Record<string, string> = {}, children: SVGSVGElement[] = [], textContent = '') {
  return {
    localName,
    attributes: Object.entries(attrs).map(([name, value]) => ({ name, value })),
    getAttribute: (name: string) => attrs[name] ?? null,
    children,
    textContent,
  } as unknown as SVGSVGElement;
}

const preview = element('svg', { color: '#ad8af3' }, [element('path', { d: 'M12 6v6l4 2' })]);

test('React and Next.js copy the installed component for the selected variant', () => {
  for (const format of ['React', 'Next.js'] as const) {
    for (const [name, component] of [['arrow-back', 'ArrowBack'], ['arrow-back-animated', 'ArrowBackAnimated'], ['arrow-back-minimalist', 'ArrowBackMinimalist']]) {
      assert.equal(formatIcon(preview, name, format), `import { ${component} } from '@ira-icons/iraicons/react';\n\n<${component} size={24} color="#ad8af3" />\n`);
    }
  }
});

test('Astro, Vue and Svelte copy imports and native template syntax without inline SVG', () => {
  const imports: [CodeFormat, string, string][] = [
    ['Astro', "import ArrowBackAnimated from '@ira-icons/iraicons/astro/arrow-back-animated';", 'size={24}'],
    ['Vue', "import { ArrowBackAnimated } from '@ira-icons/iraicons/vue';", ':size="24"'],
    ['Svelte', "import { ArrowBackAnimated } from '@ira-icons/iraicons/svelte';", 'size={24}'],
  ];
  for (const [format, statement, size] of imports) {
    const snippet = formatIcon(element('svg', { color: 'currentColor' }), 'arrow-back-animated', format);
    assert.ok(snippet.includes(statement), format);
    assert.ok(snippet.includes(`<ArrowBackAnimated ${size} />`), format);
    assert.doesNotMatch(snippet, /<svg|<path/, format);
  }
});

test('framework snippets include the selected playback speed only for animated variants', () => {
  assert.match(formatIcon(preview, 'arrow-back-animated', 'React', 1.5), /speed=\{1\.5\}/);
  assert.match(formatIcon(preview, 'arrow-back-animated', 'Vue', 0.5), /:speed="0\.5"/);
  assert.doesNotMatch(formatIcon(preview, 'arrow-back', 'React', 2), /speed=/);
});

test('SVG still copies standalone markup with the selected color and animation', () => {
  const svg = element('svg', { color: '#ad8af3', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [
    element('style', {}, [], '@keyframes draw { to { stroke-dashoffset: 0; } }'),
    element('g', {}, [element('path', { d: 'M12 6v6l4 2' })]),
  ]);
  const snippet = formatIcon(svg, 'arrow-back-animated', 'SVG');
  assert.match(snippet, /^<svg\n/);
  assert.match(snippet, /xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(snippet, /stroke="#ad8af3"/);
  assert.match(snippet, /<style>@keyframes draw/);
  assert.match(snippet, /\n    <path d="M12 6v6l4 2" \/>\n/);
  assert.doesNotMatch(snippet, /aria-hidden|@ira\/iraicons/);
});
