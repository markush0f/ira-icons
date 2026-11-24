import assert from 'node:assert/strict';
import { test } from 'node:test';
import { longestAnimationSeconds } from '../../scripts/npm-package/shared/animation-speed.ts';

test('reads the longest animation duration without counting delays or easing arguments', () => {
  assert.equal(longestAnimationSeconds(`
    .a { animation: trace 2.65s cubic-bezier(.25,.65,.35,1) 5s infinite, flicker 900ms linear infinite; }
    .b { animation-duration: 400ms; animation-delay: 10s; }
  `), 2.65);
  assert.equal(longestAnimationSeconds('.a { animation-duration: 400ms, 1.2s; }'), 1.2);
  assert.equal(longestAnimationSeconds('.a { animation-delay: 2s; }'), 0);
});
