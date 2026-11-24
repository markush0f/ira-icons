import assert from 'node:assert/strict';
import { test } from 'node:test';
import { constantIteration, longestAnimationSeconds, scaleAnimationCss, speedStyle } from '../../scripts/npm-package/shared/animation-speed.ts';

test('reads the longest animation duration without counting delays or easing arguments', () => {
  assert.equal(longestAnimationSeconds(`
    .a { animation: trace 2.65s cubic-bezier(.25,.65,.35,1) 5s infinite, flicker 900ms linear infinite; }
    .b { animation-duration: 400ms; animation-delay: 10s; }
  `), 2.65);
  assert.equal(longestAnimationSeconds('.a { animation-duration: 400ms, 1.2s; }'), 1.2);
  assert.equal(longestAnimationSeconds('.a { animation-delay: 2s; }'), 0);
});

test('constant keeps each animated icon looping unless it is turned off', () => {
  assert.equal(constantIteration(undefined), 'infinite');
  assert.equal(constantIteration(true), 'infinite');
  assert.equal(constantIteration(false), '1');
  assert.match(speedStyle(true, 1), /--ira-icon-iteration:infinite/);
  assert.match(speedStyle(true, 1, 'opacity:1', false), /--ira-icon-iteration:1/);
  assert.equal(speedStyle(false, 1, 'opacity:1', false), 'opacity:1');
  assert.equal(speedStyle(false), undefined);
  assert.match(scaleAnimationCss('.a { animation: spin 2s linear infinite; }'),
    /animation: spin calc\(2s \/ var\(--ira-icon-speed, 1\)\) linear var\(--ira-icon-iteration, infinite\)/);
});
