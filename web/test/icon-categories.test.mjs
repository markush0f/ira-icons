import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { categoriesFor, categoryLabels } from '../../scripts/icon-expansion/categories.mjs';

test('each catalog family has valid tags shared by its variants', async () => {
  const names = (await readdir(new URL('../../icons/', import.meta.url)))
    .filter(file => file.endsWith('.svg') && !/-(animated|minimalist)\.svg$/.test(file))
    .map(file => file.slice(0, -4));
  assert.ok(Object.keys(categoryLabels).length <= 30, 'categories must fit the browser mask');
  for (const name of names) {
    const ids = categoriesFor(name);
    assert.ok(ids.length > 0 && !ids.includes('other'), `${name} needs a category`);
    assert.ok(ids.every(id => Object.hasOwn(categoryLabels, id)), `${name} has an invalid category`);
    assert.equal(ids.length, new Set(ids).size);
    assert.deepEqual(categoriesFor(`${name}-minimalist`), ids);
    assert.deepEqual(categoriesFor(`${name}-animated`), ids);
  }
});

test('icons can be found under multiple subjects', () => {
  assert.deepEqual(categoriesFor('camera'), ['devices', 'media', 'photography']);
  assert.deepEqual(categoriesFor('file-video'), ['documents', 'media']);
  assert.deepEqual(categoriesFor('sign-west-pharmacy'), ['buildings', 'health', 'navigation']);
  assert.deepEqual(categoriesFor('wind-barb-n-5kt'), ['nature', 'weather']);
});
