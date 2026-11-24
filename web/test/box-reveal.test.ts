import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import sharp from 'sharp';
import { hasBoxGeometry } from '../../scripts/icon-expansion/box-reveal.ts';

const root = new URL('../../icons/', import.meta.url);

test('box recognition includes open and perspective boxes, not arbitrary circles or triangles', () => {
  for (const name of ['box', 'cube-plus', 'package-open', 'terminal', 'file-code', 'folder', 'square-rounded', 'door']) {
    assert.ok(hasBoxGeometry(name, ''), name);
  }
  assert.ok(hasBoxGeometry('custom-frame', '<rect width="18" height="12" x="3" y="6" rx="2"/>'));
  assert.ok(hasBoxGeometry('custom-frame', '<path d="M4 4h16v16H4z"/>'));
  assert.ok(hasBoxGeometry('custom-frame', '<path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"/>'));
  assert.equal(hasBoxGeometry('circle', '<path d="M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0 -18z"/>'), false);
  assert.equal(hasBoxGeometry('triangle', '<path d="M12 3L22 21H2z"/>'), false);
  assert.equal(hasBoxGeometry('tiny-detail', '<rect width="2" height="2" x="3" y="6"/>'), false);
});

test('box variants trace their strokes using table timing and preserve the completed silhouette', async () => {
  const files = (await readdir(root)).filter(name => name.endsWith('-animated.svg'));
  let reviewed = 0;
  for (const file of files) {
    const svg = await readFile(new URL(file, root), 'utf8');
    if (!svg.includes('data-design-kind="box"')) continue;
    reviewed++;
    assert.match(svg, /@media \(prefers-reduced-motion: no-preference\)/, file);
    assert.match(svg, /2\.4s linear infinite/, file);
    assert.match(svg, /87% \{ stroke-dashoffset: 0; opacity: 1; \}/, file);
    assert.doesNotMatch(svg, /ira-exp-|clip-path|<path(?! data-design-ink)/, file);
    const original = await readFile(new URL(file.replace('-animated.svg', '.svg'), root), 'utf8');
    const still = svg.replace(/<style>[\s\S]*?<\/style>/g, '');
    const pixels = async (source: string) => sharp(Buffer.from(source)).resize(96, 96).ensureAlpha().raw().toBuffer();
    const [before, after] = await Promise.all([pixels(original), pixels(still)]);
    let difference = 0;
    for (let i = 3; i < before.length; i += 4) difference += Math.abs(before[i]-after[i]);
    // Arc normalization and reversing straight segments can change antialiasing
    // slightly, but must never change the completed icon's actual silhouette.
    assert.ok(difference / (96 * 96 * 255) < .006, `${file}: changed completed geometry`);
  }
  assert.ok(reviewed > 700, `Only reviewed ${reviewed} box icons`);
});
