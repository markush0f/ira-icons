// Deliberate timelines. Geometry is visible at rest and under reduced motion.
import { svg } from './geometry.mjs';

export const draw = (body, start, end, ease = 'ease-in-out') => ({body, start, end, ease, mode:'draw'});
export const appear = (body, start, end, ease = 'ease-out') => ({body, start, end, ease, mode:'appear'});
export const move = (body, start, end, property, ease = 'ease-out') => ({body, start, end, ease, mode:'move', property});
export const plan = (comment, fixed, steps, seconds = 3.25) => ({comment,fixed,steps,seconds});

export function renderPlan(name, {comment,fixed,steps,seconds}) {
  const selectors = [], animations = [], layers = [];
  for (const [index, step] of steps.entries()) {
    const {body,start,end,ease,mode,property} = step;
    if (!(0 <= start && start < end && end <= 80)) throw Error(`Invalid timeline: ${name}/${index}`);
    const target = `[data-ira-sequence="${name}"] > [data-step="${index}"]${mode === 'draw' ? ' path' : ''}`;
    const key = `ira-seq-${name}-${index}`;
    const from = mode === 'draw' ? 'stroke-dashoffset: 1; opacity: 0;' : mode === 'appear' ? 'opacity: 0;' : property;
    const to = mode === 'draw' ? 'stroke-dashoffset: 0; opacity: 1;' : mode === 'appear' ? 'opacity: 1;' : 'transform: none;';
    const first = start ? `0%, ${start}%` : '0%';
    const keys = mode === 'draw'
      ? `${first} { ${from} } ${Math.min(start+1,end-.1)}% { stroke-dashoffset: 1; opacity: 1; } ${end}%, 92% { ${to} } 100% { stroke-dashoffset: 0; opacity: 0; }`
      : mode === 'appear'
        ? `${first} { ${from} } ${end}%, 92% { ${to} } 100% { opacity: 0; }`
        : `${first} { ${from} } ${end}%, 83% { ${to} } 100% { ${from} }`;
    selectors.push(`        ${target} { ${mode === 'draw' ? 'stroke-dasharray: 1 1; ' : ''}${mode === 'move' ? 'transform-box: view-box; transform-origin: center; ' : ''}animation: ${key} ${seconds}s ${ease} infinite; }`);
    animations.push(`        @keyframes ${key} { ${keys} }`);
    const markup = mode === 'draw' ? svg(body).replaceAll('<path ', '<path pathLength="1" ') : svg(body);
    if (mode === 'draw' && !markup.includes('pathLength=')) throw Error(`Missing pen path: ${name}/${index}`);
    layers.push(`<g data-step="${index}">${markup}</g>`);
  }
  return [`<!-- Motion: ${comment} -->`, '<style>', '    @media (prefers-reduced-motion: no-preference) {', ...animations, ...selectors, '    }', '</style>', `<g data-ira-sequence="${name}">${fixed ? svg(fixed) : ''}${layers.join('')}</g>`];
}