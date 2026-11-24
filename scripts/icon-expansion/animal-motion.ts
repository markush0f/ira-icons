type Frames = [percentage: number, value: string][];
type Gesture = {
  part: string;
  paths: number[];
  seconds: number;
  property: 'd' | 'transform';
  origin?: string;
  frames: Frames;
};

const bend = (part: string, path: number, seconds: number, ...frames: Frames): Gesture =>
  ({ part, paths: [path], seconds, property: 'd', frames });
const move = (part: string, paths: number[], seconds: number, origin: string, ...frames: Frames): Gesture =>
  ({ part, paths, seconds, property: 'transform', origin, frames });

// Path indices are in original drawing order, excluding non-path primitives.
// The first and last keyframes use the unchanged SVG geometry; 'rest' brings it back early.
const animals: Record<string, Gesture[]> = {
  bat: [bend('wings', 0, 0.98, [46,
    'M16.2 15.3c.5 -2.15 1.85 -4.1 3.8 -3.8c-.4 -2.25 .2 -4.1 -1.7 -5.6c-1.2 2.1 -2.2 2.25 -3.3 2.1v-4l-3 2l-3 -2v4c-1.1 .15 -2.1 0 -3.3 -2.1c-1.9 1.5 -1.3 3.35 -1.7 5.6c1.95 -.3 3.3 1.65 3.8 3.8c2.2 .2 3.3 2.45 4.2 4.7c.9 -2.25 2 -4.5 4.2 -4.7z'])],
  bee: [move('wings', [1], 0.48, '12px 11px', [50, 'scale(.86, .52)'])],
  bird: [bend('wing', 1, 1.15, [34, 'M6.8 16.6q4.7 -.6 7.2 -5.6'], [72, 'M7.4 14.2q4.4 -.3 6.6 -3.2'])],
  bug: [bend('legs', 1, 0.94,
    [26, 'M4.6 9.7l2.4 1.3m-3.1 5.2l3.1 -1.2m10 -4l3.1 1.2m-3.1 2.8l2.4 -1.3m-7.4 -3.7v10'],
    [74, 'M3.9 12.2l3.1 -1.2m-2.4 2.7l2.4 1.3m10 -4l2.4 -1.3m-2.4 5.3l3.1 1.2m-8.1 -6.2v10'])],
  butterfly: [move('wings', [1], 1.1, '12px 13px', [48, 'scaleX(.38)'])],
  cat: [bend('left-eye', 4, 2.9, [10, 'rest'], [15, 'M8.35 11.15L9.65 11.15'], [18, 'M8.35 11.15L9.65 11.15'], [24, 'rest']),
    bend('right-eye', 5, 2.9, [10, 'rest'], [15, 'M14.35 11.15L15.65 11.15'], [18, 'M14.35 11.15L15.65 11.15'], [24, 'rest'])],
  deer: [move('left-ear', [8], 2.7, '8.5px 10px', [16, 'rotate(-36deg)'], [25, 'rotate(14deg)'], [34, 'none']),
    move('right-ear', [9], 2.7, '15.5px 10px', [20, 'rotate(38deg)'], [29, 'rotate(-12deg)'], [38, 'none'])],
  dog: [bend('left-ear', 6, 2.55,
    [22, 'M4.15 2.8l6.85 2.17l-6.238 6.688a1.021 1.021 0 0 1 -1.41 .111a.953 .953 0 0 1 -.327 -.954l1.125 -8.015z'],
    [33, 'M4.15 2.8l6.85 2.17l-6.238 6.688a1.021 1.021 0 0 1 -1.41 .111a.953 .953 0 0 1 -.327 -.954l1.125 -8.015z'], [48, 'rest']),
    bend('right-ear', 7, 2.55,
      [27, 'M19.85 2.8l-6.85 2.17l6.238 6.688c.358 .408 .989 .458 1.41 .111a.953 .953 0 0 0 .327 -.954l-1.125 -8.015z'],
      [37, 'M19.85 2.8l-6.85 2.17l6.238 6.688c.358 .408 .989 .458 1.41 .111a.953 .953 0 0 0 .327 -.954l-1.125 -8.015z'], [53, 'rest'])],
  fish: [bend('tail', 0, 1.24,
    [25, 'M3 12q5-7 11-3l3.6-1v8l-3.6-1q-6 4-11-3z'],
    [50, 'rest'],
    [75, 'M3 12q5-7 11-3l3.6-1v8l-3.6-1q-6 4-11-3z'])],
  horse: [bend('tail', 1, 2.45, [20, 'M20.5 16v-1.7a5.4 3.1 72 0 0 -1.5 -5.3'],
    [35, 'M22.6 12.5v-1a3.7 2.5 0 0 0 -3.6 -2.5'], [48, 'rest'])],
  pig: [bend('ear', 1, 2.7,
    [20, 'M15.05 2.4l.95 4.403a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342a6.008 6.008 0 0 1 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2l0 -.027a6 6 0 0 1 4 -10.473h2.5l3.55 -3.6z'],
    [32, 'rest'])],
  spider: [move('left-outer-legs', [0, 2], 1.02, '10px 11px', [25, 'rotate(8deg)'], [75, 'rotate(-8deg)']),
    move('left-middle-leg', [1], 1.02, '10px 11px', [25, 'rotate(-10deg)'], [75, 'rotate(10deg)']),
    move('right-outer-legs', [3, 5], 1.02, '14px 11px', [25, 'rotate(8deg)'], [75, 'rotate(-8deg)']),
    move('right-middle-leg', [4], 1.02, '14px 11px', [25, 'rotate(-10deg)'], [75, 'rotate(10deg)'])],
};

export function animalMotionFor(name: string, geometry: string) {
  const gestures = Object.hasOwn(animals, name) ? animals[name] : undefined;
  if (!gestures) return;
  const layer = `data-ira-animal="${name}"`;
  const rules: string[] = [];
  const tagged = new Set<number>();
  let index = 0;
  const drawing = geometry.replace(/<path d="([^"]+)"/g, (path, d: string) => {
    const current = index++;
    const gesture = gestures.find(({ paths }) => paths.includes(current));
    if (!gesture) return path;
    tagged.add(current);
    if (current === gesture.paths[0]) {
      const { part, seconds, property, origin, frames } = gesture;
      const key = `ira-animal-${name}-${part}`;
      const eye = part.endsWith('-eye');
      // The eyelid needs matching line commands to interpolate from the vertical eye dot.
      const base = eye ? d.replace(/^M(\d+) 11v\.01$/, 'M$1 11L$1 11.01') : property === 'd' ? d : 'none';
      const pose = (at: string, value: string) => {
        const rest = value === 'rest';
        const shape = rest ? base : value;
        const style = property === 'd' ? `path("${shape}")` : shape;
        // A closing eye changes from a round dot to a thin eyelid.
        const eyelid = eye ? ` stroke-width: ${rest ? 2 : 0.9};` : '';
        return `${at} { ${property}: ${style};${eyelid} }`;
      };
      const poses = [pose('0%, 100%', 'rest'), ...frames.map(([at, value]) => pose(`${at}%`, value))].join(' ');
      rules.push(`        @keyframes ${key} { ${poses} }`,
        `        [${layer}] [data-ira-part="${part}"] { ${origin ? `transform-origin: ${origin}; ` : ''}animation: ${key} ${seconds}s ease-in-out infinite; }`);
    }
    return `<path data-ira-part="${gesture.part}" d="${d}"`;
  });
  if (gestures.some(({ paths }) => paths.some(path => !tagged.has(path)))) throw Error(`Missing animal motion path: ${name}`);
  return ['<style>', '    @media (prefers-reduced-motion: no-preference) {', ...rules, '    }', '</style>',
    `<g ${layer}>${drawing}</g>`];
}
