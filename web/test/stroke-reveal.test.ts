import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import sharp from 'sharp';
import { renderStrokeReveal, splitStrokes } from '../../scripts/icon-expansion/stroke-reveal.ts';

const root = new URL('../../icons/', import.meta.url);

test('pen lifts draw independently and accumulate in arrow-style sequence', () => {
  assert.deepEqual(splitStrokes('M2 3h8m0 4h-6'), ['M2 3L10 3', 'M10 7L4 7']);
  const svg = renderStrokeReveal('example', '<path d="M2 3h8m0 4h-6"/>').join('\n');
  assert.match(svg, /data-ira-line="0" pathLength="1" d="M2 3L10 3"/);
  assert.match(svg, /data-ira-line="1" pathLength="1" d="M10 7L4 7"/);
  assert.match(svg, /ira-stroke-example-1 \{ 0%, 23\.5% \{ stroke-dashoffset: 1; opacity: 0;/);
  assert.match(svg, /47%, 88% \{ stroke-dashoffset: 0; opacity: 1;/);
  assert.match(svg, /2\.65s cubic-bezier\(\.25,\.65,\.35,1\) infinite/);
  assert.doesNotMatch(svg, /clip-path|transform:/);
});

test('filled details keep their attributes and true circles start at twelve', () => {
  const svg = renderStrokeReveal('example', '<circle cx="12" cy="12" r="4"/><path d="M2 2h4v4z" fill="currentColor" stroke-width=".8"/>').join('\n');
  assert.match(svg, /d="M12 8A4 4 0 1 1 12 16A4 4 0 1 1 12 8z"/);
  assert.match(svg, /fill="currentColor" stroke-width=".8"/);
  assert.match(svg, /fill-opacity: 0/);
});

test('every animated icon uses scoped tracing, respects reduced motion, and preserves its original silhouette', async () => {
  const files = (await readdir(root)).filter(name => name.endsWith('-animated.svg'));
  assert.ok(files.length > 3300);
  const failures: string[] = [];
  for (const file of files) {
    const name = file.replace('-animated.svg', '');
    const svg = await readFile(new URL(file, root), 'utf8');
    assert.ok(svg.includes(`data-ira-arrow-reveal="${name}"`) ||
      svg.includes(`data-ira-design-reveal="${name}"`) ||
      svg.includes(`data-ira-stroke-reveal="${name}"`), file);
    assert.match(svg, /@media \(prefers-reduced-motion: no-preference\)/, file);
    assert.match(svg, /stroke-dashoffset: 0/, file);
    assert.doesNotMatch(svg, /clip-path|(?:^|[;{\s])(?:transform|d):|animation-delay:/, file);
    const original = await readFile(new URL(`${name}.svg`, root), 'utf8');
    const still = svg.replace(/<style>[\s\S]*?<\/style>/g, '');
    const pixels = async (source: string) => sharp(Buffer.from(source)).resize(96, 96).ensureAlpha().raw().toBuffer();
    const [before, after] = await Promise.all([pixels(original), pixels(still)]);
    let difference = 0;
    for (let i = 3; i < before.length; i += 4) difference += Math.abs(before[i]-after[i]);
    if (difference / (96*96*255) >= .006) failures.push(file);
  }
  assert.deepEqual(failures, [], 'Completed/reduced-motion poses changed');
});
