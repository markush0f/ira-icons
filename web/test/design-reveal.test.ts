import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const icon = (name: string) => readFile(new URL(`../../icons/${name}-animated.svg`, import.meta.url), 'utf8');
const respectsMotion = (svg: string) => assert.match(svg, /@media \(prefers-reduced-motion: no-preference\)/);

test('a line chart keeps its axes and traces its series from the first data point', async () => {
  const svg = await icon('chart-line');
  assert.match(svg, /<path d="M3 4v16h18"\/><path data-design-ink="line" pathLength="1" d="M7 15l4-5 4 2 6-7"/);
  assert.match(svg, /ira-design-chart-line-line \{ 0% \{ stroke-dashoffset: 1;/);
  assert.match(svg, /49%, 87% \{ stroke-dashoffset: 0;/);
  assert.match(svg, /animation: ira-design-chart-line-line 2\.8s linear infinite;/);
  respectsMotion(svg);
});

test('histogram bars begin at their base, not at the top or at a clipping edge', async () => {
  const svg = await icon('chart-histogram');
  assert.match(svg, /data-design-ink="sample-0" pathLength="1" d="M8 21L8 16"/);
  assert.match(svg, /data-design-ink="sample-2" pathLength="1" d="M20 21L20 18"/);
  assert.doesNotMatch(svg, /clip-path/);
});

test('each full circle starts at twelve; interior strokes draw on the same timeline', async () => {
  const svg = await icon('circle-x');
  assert.match(svg, /data-design-ink="ring" pathLength="1" d="M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0 -18z"/);
  assert.match(svg, /data-design-ink="line" pathLength="1" d="M10 10L14 14"/);
  assert.match(svg, /data-design-ink="line" pathLength="1" d="M14 10L10 14"/);
  const timelines = [...svg.matchAll(/@keyframes ira-design-circle-x-(?:ring|line) \{ (.*) \}/g)].map(match => match[1]);
  assert.equal(timelines.length, 2);
  assert.equal(timelines[0], timelines[1]);
  assert.match(await icon('circle-dotted'), /clip-path: polygon\(50% 50%, 50% 0%, 50% 0%/);
  respectsMotion(svg);
});

test('table rows progressively accumulate from top to bottom', async () => {
  const svg = await icon('table');
  assert.match(svg, /data-design-ink="row-0" pathLength="1" d="M3 9H21"/);
  assert.match(svg, /data-design-ink="row-1" pathLength="1" d="M3 14\.5H21"/);
  assert.match(svg, /ira-design-table-row-1 \{ 0%, 12% \{ stroke-dashoffset: 1;/);
  assert.doesNotMatch(svg, /clip-path/);
  respectsMotion(svg);
});
