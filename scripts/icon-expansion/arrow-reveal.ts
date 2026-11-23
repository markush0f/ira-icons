import { g, p } from './geometry.ts';

type Ink = { d: string; phase: 'tip' | 'shaft' | 'branch'; reverse?: boolean };
// Custom head paths below are stored vertex-first; play them from the rear.
const tip = (d: string): Ink => ({ d, phase: 'tip', reverse: true });
const shaft = (d: string, reverse = false): Ink => ({ d, phase: 'shaft', reverse });
const branch = (d: string, reverse = false): Ink => ({ d, phase: 'branch', reverse });
type Reveal = { ink: Ink[]; fixed?: string[]; transform?: string };
const pose = (ink: Ink[], fixed: string[] = [], transform?: string): Reveal => ({ ink, fixed, transform });

// Start on the rear ends of the arms and converge at the pointing vertex.
const head = (x: number, y: number, ax: number, ay: number, bx: number, by: number): Ink[] => [
  { d: `M${ax} ${ay}L${x} ${y}`, phase: 'tip' },
  { d: `M${bx} ${by}L${x} ${y}`, phase: 'tip' },
];
const up = (x: number, y: number, w: number) => head(x, y, x - w, y + w, x + w, y + w);
const down = (x: number, y: number, w: number) => head(x, y, x - w, y - w, x + w, y - w);
const left = (x: number, y: number, w: number) => head(x, y, x + w, y - w, x + w, y + w);
const right = (x: number, y: number, w: number) => head(x, y, x - w, y - w, x - w, y + w);
const rotate = (a: number) => `rotate(${a} 12 12)`;

const turns: Record<string, number> = { up: 0, right: 90, down: 180, left: 270, 'up-left': -45, 'up-right': 45, 'down-left': -135, 'down-right': 135 };
const own: Record<string, Reveal> = {
  'arrow-left': pose([...left(3, 12, 7), shaft('M3 12H21')]),
  'arrow-right': pose([...right(21, 12, 7), shaft('M21 12H3')]),
  'arrow-up-down': pose([...up(12, 3, 4), ...down(12, 21, 4), shaft('M12 3v9'), shaft('M12 21v-9')]),
  'chevron-up': pose(head(12, 8.5, 5, 15.5, 19, 15.5)),
  'chevron-down': pose(head(12, 15.5, 5, 8.5, 19, 8.5)),
  'chevron-left': pose(head(8.5, 12, 15.5, 5, 15.5, 19)),
  'chevron-right': pose(head(15.5, 12, 8.5, 5, 8.5, 19)),
  expand: pose([...head(20, 4, 14, 4, 20, 10), ...head(4, 20, 10, 20, 4, 14), shaft('M20 4l-6 6'), shaft('M4 20l6 -6')]),
  collapse: pose([...head(14, 10, 14, 5, 19, 10), ...head(10, 14, 5, 14, 10, 19), shaft('M14 10l6 -6'), shaft('M10 14l-6 6')]),
  move: pose([...up(12, 3, 3), ...down(12, 21, 3), ...left(3, 12, 3), ...right(21, 12, 3), ...['M12 3v9', 'M12 21v-9', 'M3 12h9', 'M21 12h-9'].map(d => shaft(d))]),
  refresh: pose([tip('M20 9v-5'), tip('M20 9h-5'), tip('M4 15v5'), tip('M4 15h5'), shaft('M4 9a8 8 0 0 1 13-3l3 3', true), shaft('M20 15a8 8 0 0 1-13 3l-3-3', true)]),
  signpost: pose([tip('M21 8l-4 -3'), tip('M21 8l-4 3'), tip('M4 16l3 -3'), tip('M4 16l3 3'), shaft('M17 5H4v6h13'), shaft('M7 13h13v6H7')], ['M12 3v18']),
};
own['arrow-left-right'] = { ...own['arrow-up-down'], transform: rotate(90) };
for (const [dir, a] of Object.entries(turns)) {
  own[`arrow-${dir}`] ??= pose([...up(12, 4, 6), shaft('M12 4V20')], [], rotate(a));
  if (a % 90 === 0) {
    own[`double-chevron-${dir}`] = pose([...up(12, 5, 6), ...up(12, 13, 6).map(({ d }) => shaft(d, true))], [], rotate(a));
    const target = dir === 'up' ? 'top' : dir === 'down' ? 'bottom' : dir;
    own[`arrow-to-${target}`] = pose([...up(12, 7, 4), shaft('M12 7v14')], ['M5 3h14'], rotate(a));
  } else {
    const x = dir.endsWith('left') ? 1 : -1, y = dir.startsWith('up') ? 1 : -1;
    own[`corner-${dir}`] = pose([...left(5, 11, 5), shaft('M19 19v-5a3 3 0 0 0-3-3H5', true)], [], `translate(12 12) scale(${x} ${y}) translate(-12 -12)`);
  }
}

// Indices refer to the original Folio row. A negative dash offset reveals
// from the endpoint without rewriting paths with arcs or Béziers.
const folio: Record<string, (paths: string[]) => Reveal> = {};
const define = (name: string, ink: Ink[], fixed: number[] = []) => {
  folio[name] = paths => pose(ink, fixed.map(x => paths[x]));
};

// Main point(s), route, secondary branches, stationary references.
define('arrow-autofit-content', [...left(3, 7, 3), ...right(21, 7, 3), shaft('M3 7h7'), shaft('M21 7h-7')], [2]);
define('arrow-autofit-height', [...up(18, 3, 3), ...down(18, 21, 3), shaft('M18 3v7'), shaft('M18 21v-7')], [0]);
define('arrow-autofit-left', [...left(3, 18, 3), shaft('M3 18h17')], [0]);
define('arrow-autofit-right', [...right(21, 18, 3), shaft('M21 18H4')], [0]);
define('arrow-autofit-width', [...left(3, 18, 3), ...right(21, 18, 3), shaft('M3 18h7'), shaft('M21 18h-7')], [0]);
define('arrow-back', [...left(5, 15, 4), shaft('M5 15h11a4 4 0 0 0 0 -8h-1')]);
define('arrow-forward', [...right(19, 15, 4), shaft('M19 15h-11a4 4 0 0 1 0 -8h1')]);
define('arrow-badge-left', [tip('M7 12l4 -5'), tip('M7 12l4 5'), shaft('M11 7h6l-4 5'), shaft('M11 17h6l-4 -5')]);
define('arrow-badge-right', [tip('M17 12l-4 -5'), tip('M17 12l-4 5'), shaft('M13 7h-6l4 5'), shaft('M13 17h-6l4 -5')]);
define('arrow-bar-both', [...left(2, 12, 3), ...right(22, 12, 3), shaft('M2 12h6'), shaft('M22 12h-6')], [4]);
for (const [dir, x, other] of [['left', 4, 14], ['right', 20, 10]] as const) {
  const point = dir === 'left' ? left : right;
  define(`arrow-bar-${dir}`, [...point(x, 12, 4), shaft(`M${x} 12H${other}`)], [3]);
  for (const [kind, tail] of [['bar', dir === 'left' ? 21 : 3], ['circle', dir === 'left' ? 17 : 7], ['rhombus', dir === 'left' ? 16 : 8], ['square', dir === 'left' ? 17 : 7], ['tail', dir === 'left' ? 18 : 6], ['narrow', dir === 'left' ? 19 : 5], ['move', dir === 'left' ? 13 : 11]] as const) {
    const fixed = kind === 'narrow' ? [] : [kind === 'circle' && dir === 'right' ? 1 : kind === 'tail' && dir === 'right' ? 1 : 2];
    const ink = [...point(kind === 'narrow' ? (dir === 'left' ? 5 : 19) : (dir === 'left' ? 3 : 21), 12, kind === 'narrow' ? 4 : 3), shaft(`M${kind === 'narrow' ? (dir === 'left' ? 5 : 19) : (dir === 'left' ? 3 : 21)} 12H${tail}`)];
    if (kind === 'tail') folio[`arrow-${dir}-${kind}`] = paths => pose([...ink, branch(paths[fixed[0]])]);
    else define(kind === 'narrow' || kind === 'move' ? `arrow-${kind}-${dir}` : `arrow-${dir}-${kind}`, ink, fixed);
  }
}
for (const [dir, x, other] of [['left', 8, 13], ['right', 17, 12]] as const) {
  define(`arrow-bear-${dir}`, [...head(x, 3, other, 3, x, 8), shaft(dir === 'left' ? 'M8 3l7.536 7.536a5 5 0 0 1 1.464 3.534v6.93' : 'M17 3l-7.536 7.536a5 5 0 0 0 -1.464 3.534v6.93')]);
}
// After the body reaches the shoulders, the thick head's flanks meet at the nose.
define('arrow-big-left', [tip('M3.414 12a1 1 0 0 1 .293 -.707l6.586 -6.586a1 1 0 0 1 1.707 .707'), tip('M3.414 12a1 1 0 0 0 .293 .707l6.586 6.586a1 1 0 0 0 1.707 -.707'), shaft('M12 5.414V9h8a1 1 0 0 1 1 1v2'), shaft('M12 18.586V15h8a1 1 0 0 0 1 -1v-2')]);
define('arrow-big-right', [tip('M20.586 12a1 1 0 0 0 -.293 -.707l-6.586 -6.586a1 1 0 0 0 -1.707 .707'), tip('M20.586 12a1 1 0 0 1 -.293 .707l-6.586 6.586a1 1 0 0 1 -1.707 -.707'), shaft('M12 5.414V9H4a1 1 0 0 0 -1 1v2'), shaft('M12 18.586V15H4a1 1 0 0 1 -1 -1v-2')]);
define('arrow-bounce', [...head(20, 6, 15, 6, 20, 11), shaft('M3 8a9 9 0 0 1 9 9v1l1.428 -4.285a12 12 0 0 1 6.018 -6.938l.554 -.277', true)], [0]);
define('arrow-capsule', [...down(18, 11, 3), shaft('M18 15a6 6 0 1 1 -12 0v-6a6 6 0 1 1 12 0v2', true)]);
for (const [dir, x] of [['left', 10], ['right', 14]] as const) folio[`arrow-curve-${dir}`] = paths => pose([...up(x, 3, 4), shaft(paths[1])]);
for (const [kind, start] of [['bar', 3], ['circle', 7], ['rhombus', 8], ['square', 7], ['tail', 6]] as const) {
  define(`arrow-down-${kind}`, [...down(12, 21, 3), shaft(`M12 21V${start}`), ...(kind === 'tail' ? [branch('M9 3l3 3l3 -3')] : [])], kind === 'tail' ? [] : [2]);
}
define('arrow-down-dashed', [...down(12, 19, 6), shaft('M12 19v-6'), branch('M12 10v-1.5'), branch('M12 5.5v-.5')]);
define('arrow-left-dashed', [...left(5, 12, 6), shaft('M5 12h6'), branch('M14 12h1.5'), branch('M18.5 12h.5')]);
define('arrow-right-dashed', [...right(19, 12, 6), shaft('M19 12h-6'), branch('M10 12H8.5'), branch('M5.5 12H5')]);
define('arrow-elbow-left', [...head(3, 8, 3, 14, 9, 8), shaft('M3 8l9 9l9 -9')]);
define('arrow-elbow-right', [...head(21, 8, 21, 14, 15, 8), shaft('M21 8l-9 9l-9 -9')]);
folio['arrow-fork'] = paths => pose([...head(21, 3, 16, 3, 21, 8), ...head(3, 3, 8, 3, 3, 8), shaft(paths[2]), shaft(paths[3])]);
folio['arrow-guide'] = paths => pose([...right(21, 7, 3), shaft(paths[1], true)], [paths[0]]);
folio['arrow-iteration'] = paths => pose([...right(21, 16, 3), shaft(paths[1], true), branch(paths[0])]);
folio['arrow-loop-left'] = paths => pose([...left(4, 12, 4), shaft(paths[0], true)]);
folio['arrow-loop-right'] = paths => pose([...right(21, 12, 4), shaft(paths[0], true)]);
folio['arrow-merge'] = paths => pose([...up(12, 3, 4), shaft(paths[1]), shaft(paths[2])]);
folio['arrow-merge-both'] = paths => pose([...up(12, 4, 4), shaft(paths[1], true), branch(paths[2], true), branch(paths[3], true)]);
for (const [dir, x] of [['left', 3], ['right', 21]] as const) {
  const point = dir === 'left' ? left : right;
  folio[`arrow-merge-${dir}`] = paths => pose([...up(12, 4, 4), shaft(paths[1], true), branch(paths[2], true)]);
  folio[`arrow-ramp-${dir}`] = paths => pose([...up(dir === 'left' ? 17 : 7, 3, 4), ...point(x, 10, 4), shaft(paths[0]), shaft(paths[3], true)]);
  folio[`arrow-rotary-${dir}`] = paths => pose([...point(x, 7, 4), shaft(paths[dir === 'left' ? 2 : 3], dir === 'left'), branch(paths[1], true)], [paths[0]]);
}
define('arrow-rotary-straight', [...up(13, 3, 4), shaft('M13 3v7'), branch('M13 16v5')], [0]);

const ne = head(20, 4, 16, 4, 20, 8), sw = head(4, 20, 8, 20, 4, 16);
const se = head(20, 20, 16, 20, 20, 16), nw = head(4, 4, 8, 4, 4, 8);
folio['arrows-cross'] = paths => pose([...ne, ...se, shaft(paths[1], true), shaft(paths[4], true), branch(paths[2], true)]);
folio.switch = paths => pose([...head(19, 4, 15, 4, 19, 8), ...head(19, 19, 15, 19, 19, 15), shaft(paths[1], true), shaft(paths[4], true), branch(paths[2], true)]);
folio['arrows-diagonal'] = paths => pose([...ne, ...sw, shaft(paths[1], true), shaft(paths[3])]);
folio['arrows-maximize'] = paths => pose([...ne, ...sw, ...se, ...nw, shaft(paths[1], true), shaft(paths[3]), shaft(paths[5], true), shaft(paths[7])]);
folio['arrows-minimize'] = paths => pose([...head(9, 9, 5, 9, 9, 5), ...head(9, 15, 5, 15, 9, 19), ...head(15, 9, 19, 9, 15, 5), ...head(15, 15, 19, 15, 15, 19), shaft(paths[1], true), shaft(paths[3], true), shaft(paths[5]), shaft(paths[7])]);
define('arrows-diff', [...left(11, 16, 4), ...right(13, 8, 4), shaft('M11 16h10'), shaft('M13 8H3')]);
define('arrows-exchange', [tip('M21 10l-4 -4'), tip('M3 14l4 4'), shaft('M21 10H7'), shaft('M3 14h14')]);
define('arrows-horizontal', [...left(3, 12, 4), ...right(21, 12, 4), shaft('M3 12h9'), shaft('M21 12h-9')]);
define('arrows-vertical', [...up(12, 3, 4), ...down(12, 21, 4), shaft('M12 3v9'), shaft('M12 21v-9')]);
folio['arrows-join'] = paths => pose([...right(21, 12, 3), shaft(paths[0], true), branch(paths[1], true)]);
for (const [dir, x, tail] of [['left', 3, 21], ['right', 21, 3]] as const) {
  const point = dir === 'left' ? left : right;
  define(`arrows-${dir}`, [...point(x, 7, 3), ...point(x, 17, 3), shaft(`M${x} 7H${tail}`), shaft(`M${x} 17H${tail}`)]);
}
define('arrows-move', [...right(21, 12, 3), ...left(3, 12, 3), ...down(12, 21, 3), ...up(12, 3, 3), ...['M21 12h-6', 'M3 12h6', 'M12 21v-6', 'M12 3v6'].map(d => shaft(d))]);
folio['arrows-random'] = paths => pose([...head(16, 21, 20, 21, 16, 17), ...head(3, 7.504, 6.5, 9.504, 5, 4), ...head(8, 15, 4, 16, 9, 19), ...head(20.5, 9, 21, 5, 16.5, 8.5), shaft(paths[1]), shaft(paths[3]), shaft(paths[5]), shaft(paths[7])]);
define('arrows-shuffle', [...right(21, 7, 3), ...right(21, 17, 3), shaft('M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5', true), shaft('M21 7h-5a4.978 4.978 0 0 0 -3 1'), branch('M9 16a4.984 4.984 0 0 1 -3 1h-3')]);
define('arrows-sort', [...up(7, 5, 4), ...down(17, 19, 4), shaft('M7 5v14'), shaft('M17 19V5')]);
folio['arrows-split'] = paths => pose([...right(21, 7, 3), ...right(21, 17, 3), shaft('M21 17h-8l-3.5 -5'), shaft(paths[1]), branch('M9.5 12H3')]);

for (const [dir, x] of [['left', 6], ['right', 12]] as const) {
  const point = dir === 'left' ? left : right;
  const first = dir === 'left' ? x : x + 6, second = dir === 'left' ? x + 6 : x;
  define(`chevrons-${dir}`, [...point(first, 12, 5), ...point(second, 12, 5).map(({ d }) => shaft(d, true))]);
}
define('caret-left', [tip('M8 12l6 -6'), tip('M8 12l6 6'), shaft('M14 6v12')]);
define('caret-right', [tip('M16 12l-6 -6'), tip('M16 12l-6 6'), shaft('M10 6v12')]);
define('direction', [...up(12, 7, 3), ...down(12, 17, 3)]);
folio.directions = paths => pose([tip('M21 7l-2 -2'), tip('M21 7l-2 2'), tip('M4 15l2 -2'), tip('M4 15l2 2'), shaft('M19 5H8v4h11'), shaft('M6 13h8v4H6')], paths.slice(0, 4));
define('fold', [...down(12, 9, 3), ...up(12, 15, 3), shaft('M12 9V3'), shaft('M12 15v6')], [2, 3, 4, 5]);
define('step-into', [...down(12, 15, 4), shaft('M12 15V3')], [3]);
define('step-out', [...up(12, 3, 4), shaft('M12 3v12')], [3]);
define('selector', [...up(12, 5, 4), ...down(12, 19, 4)]);
define('switch-horizontal', [...right(20, 7, 4), ...left(4, 17, 4), shaft('M20 7H10'), shaft('M4 17h9')]);
define('switch-vertical', [...up(7, 4, 4), ...down(17, 20, 4), shaft('M7 4v9'), shaft('M17 20V10')]);
for (const [dir, x] of [['left', 4], ['right', 20]] as const) {
  define(`swipe-${dir}`, [...(dir === 'left' ? left : right)(x, 12, 3), shaft(`M${x} 12H12`)], [0]);
}
for (const [dir, x, y, tx, ty] of [['left', 7, 12, 15, 12], ['right', 17, 12, 9, 12], ['top', 12, 7, 12, 15], ['bottom', 12, 17, 12, 9]] as const) {
  const point = { left, right, top: up, bottom: down }[dir];
  define(`transition-${dir}`, [...point(x, y, 3), shaft(`M${x} ${y}L${tx} ${ty}`)], [0, 1]);
}
// Keep the badge fixed. The point is split into independent arms before the arc.
for (const name of ['refresh-alert', 'refresh-dot']) {
  define(name, [tip('M4 9v-4'), tip('M4 9h4'), tip('M20 15v4'), tip('M20 15h-4'), shaft('M20 11a8.1 8.1 0 0 0 -15.5 -2', true), shaft('M4 13a8.1 8.1 0 0 0 15.5 2', true)], name === 'refresh-alert' ? [2, 3] : [2]);
}
for (const [name, x] of [['rotate', 19.95], ['rotate-dot', 19.95], ['rotate-clockwise', 4.05]] as const) {
  const rightSide = x > 12;
  define(name, [tip(`M${x} 15l${rightSide ? -5 : 5} 0`), tip(`M${x} 15v5`), shaft(rightSide ? 'M19.95 11a8 8 0 1 0 -.5 4' : 'M4.05 11a8 8 0 1 1 .5 4', true)], name === 'rotate-dot' ? [1] : []);
}
define('reload', [tip('M20 9v-5'), tip('M20 9h-5'), shaft('M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747', true)]);
folio['rotate-rectangle'] = paths => pose([tip('M7.05 7.05v3.988'), tip('M7.05 7.05h-3.988'), shaft(paths[0].replace(/h-3\.988$/, ''), true)]);

export const manualArrowReveals = ['arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'refresh'];
export function arrowRevealFor(name: string, paths?: string[]) {
  if (paths && Object.hasOwn(folio, name)) return { ...folio[name](paths), transform: 'translate(1.5 1.5) scale(.875)' };
  return Object.hasOwn(own, name) ? own[name] : undefined;
}

export function renderArrowReveal(name: string, { ink, fixed, transform }: Reveal) {
  if (!ink.length || [...ink.map(({ d }) => d), ...(fixed ?? [])].some(d => !d)) throw Error(`Missing arrow geometry: ${name}`);
  const selector = `[data-ira-arrow-reveal="${name}"]`;
  const has = (phase: Ink['phase']) => ink.some(step => step.phase === phase);
  const phases = { branch: [0, 15], shaft: has('branch') ? [15, 33] : [0, 30], tip: has('shaft') ? (has('branch') ? [33, 50] : [30, 47]) : [0, 19] };
  // The route definitions run from the head back to their origins. Reverse
  // their playback while keeping the arrowhead arms aimed at the vertex.
  const playback = ink.map(step => ({ ...step, reverse: step.phase === 'tip' ? Boolean(step.reverse) : !step.reverse }));
  const rules = Object.entries(phases).flatMap(([phase, [start, finish]]) => [false, true].flatMap(reverse => {
    const part = `${phase}${reverse ? '-back' : ''}`;
    if (!playback.some(step => step.phase === phase && step.reverse === reverse)) return [];
    const key = `ira-arrow-${name}-${part}`;
    const hidden = `${reverse ? '-' : ''}1`;
    return [
      `        @keyframes ${key} { ${start ? `0%, ${start}%` : '0%'} { stroke-dashoffset: ${hidden}; opacity: 0; } ${start + .4}% { opacity: 1; } ${finish}%, 88% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }`,
      `        ${selector} [data-ink="${part}"] { animation: ${key} 2.65s cubic-bezier(.25,.65,.35,1) infinite; }`,
    ];
  }));
  const reference = fixed?.length ? `<g data-reference="">${fixed.map(p).join('')}</g>` : '';
  if (reference) {
    const key = `ira-arrow-${name}-reference`;
    rules.push(
      `        @keyframes ${key} { 0%, 8% { opacity: 0; } 24%, 88% { opacity: 1; } 100% { opacity: 0; } }`,
      `        ${selector} [data-reference] { animation: ${key} 2.65s ease-out infinite; }`,
    );
  }
  const drawing = reference + playback.map(({ d, phase, reverse }) => `<path data-ink="${phase}${reverse ? '-back' : ''}" pathLength="1" d="${d}"/>`).join('');
  return ['<!-- Motion: trace the route from its origin to the destination, then finish the arrowhead. -->', '<style>', '    @media (prefers-reduced-motion: no-preference) {', `        ${selector} [data-ink] { stroke-dasharray: 1 1; }`, ...rules, '    }', '</style>', `<g data-ira-arrow-reveal="${name}">${transform ? g(transform, drawing) : drawing}</g>`];
}
