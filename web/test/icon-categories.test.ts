import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { categoriesFor, categoryLabels, categoryGroups } from '../../scripts/icon-expansion/categories.ts';
import { categoryIcons } from '../src/lib/category-icons.ts';

test('every category has an existing minimalist example icon', async () => {
  const files = new Set(await readdir(new URL('../../icons/', import.meta.url)));
  assert.deepEqual(Object.keys(categoryIcons).sort(), Object.keys(categoryLabels).sort());
  for (const [id, name] of Object.entries(categoryIcons)) {
    assert.ok(files.has(`${name}-minimalist.svg`), `${id} needs an existing icon`);
  }
});

test('each catalog family has valid tags shared by its variants', async () => {
  const names = (await readdir(new URL('../../icons/', import.meta.url)))
    .filter(file => file.endsWith('.svg') && !/-(animated|minimalist)\.svg$/.test(file))
    .map(file => file.slice(0, -4));
  const grouped = Object.values(categoryGroups).flatMap(ids => ids.split(' '));
  assert.deepEqual(grouped.sort(), Object.keys(categoryLabels).sort());
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
  assert.deepEqual(categoriesFor('file-video'), ['documents', 'media', 'video']);
  assert.deepEqual(categoriesFor('sign-west-pharmacy'), ['buildings', 'health', 'navigation', 'places']);
  assert.deepEqual(categoriesFor('wind-barb-n-5kt'), ['nature', 'weather', 'wind']);
});

test('classifies arrows by action, not incidental arrow shapes', () => {
  assert.deepEqual(categoriesFor('arrow-right'), ['arrows', 'interface']);
  assert.deepEqual(categoriesFor('chevrons-left'), ['arrows', 'interface']);
  assert.deepEqual(categoriesFor('directions'), ['arrows', 'navigation']);
  assert.deepEqual(categoriesFor('arrow-ramp-left'), ['arrows', 'interface', 'navigation']);
  assert.deepEqual(categoriesFor('rotate-dot'), ['arrows', 'interface']);
  assert.deepEqual(categoriesFor('axis-y'), ['data']);
  for (const name of ['file-arrow-left', 'chart-arrows', 'archery-arrow', 'target-arrow', 'text-direction-ltr']) {
    assert.ok(!categoriesFor(name).includes('arrows'), name);
  }
});
