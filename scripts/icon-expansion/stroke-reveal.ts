import { SVGPathData, type SVGCommand } from 'svg-pathdata';
import { normalizeRings } from './design-reveal.ts';

// Split pen lifts into independent strokes. A compound path must never reveal
// several disconnected pieces from unrelated points on the same dash timeline.
export function splitStrokes(d: string) {
  const paths: SVGCommand[][] = [];
  for (const command of new SVGPathData(d).toAbs().normalizeHVZ(false).commands) {
    if (command.type === SVGPathData.MOVE_TO) paths.push([command]);
    else paths.at(-1)!.push(command);
  }
  return paths.filter(path => path.length > 1).map(path => new SVGPathData(path).encode());
}

export function renderStrokeReveal(name: string, body: string) {
  const strokes: { id: number; filled: boolean }[] = [];
  const scope = `[data-ira-stroke-reveal="${name}"]`;
  const mark = (tag: string, attrs: string, d?: string) => {
    const id = strokes.length;
    const filled = /\bfill="(?!none\b|transparent\b)[^"]+"/.test(attrs);
    strokes.push({ id, filled });
    const clean = attrs.replace(/\s*(?:pathLength|data-design-ink)="[^"]*"/g, '').trim();
    return `<${tag} data-ira-line="${id}" pathLength="1"${clean ? ' '+clean : ''}${d === undefined ? '' : ` d="${d}"`}/>`;
  };
  const drawing = normalizeRings(body).replace(/<(path|rect)\b([^>]*?)\s*\/>/g, (_, tag: string, attrs: string) => {
    if (tag === 'rect') return mark(tag, attrs);
    const d = attrs.match(/\bd="([^"]+)"/)?.[1];
    if (!d) throw Error(`Missing stroke geometry: ${name}`);
    const attributes = attrs.replace(/\s*\bd="[^"]+"/, '');
    // Filled compound shapes must retain their winding/holes as one path.
    const parts = /\bfill="(?!none\b|transparent\b)[^"]+"/.test(attrs) ? [d] : splitStrokes(d);
    return parts.map(part => mark(tag, attributes, part)).join('');
  });
  if (!strokes.length || /<(?:path|rect|circle)\b(?![^>]*data-ira-line=)/.test(drawing)) {
    throw Error(`Untraced geometry: ${name}`);
  }
  const round = (value: number) => Number(value.toFixed(4));
  const rules = strokes.flatMap(({ id, filled }) => {
    const start = round(47 * id / strokes.length);
    const end = round(47 * (id+1) / strokes.length);
    const key = `ira-stroke-${name}-${id}`;
    const frames = `${start ? `0%, ${start}%` : '0%'} { stroke-dashoffset: 1; opacity: 0;${filled ? ' fill-opacity: 0;' : ''} } ${round(start + Math.min(.4,(end-start)/4))}% { opacity: 1; } ${filled ? `${round(end-Math.min(.4,(end-start)/4))}% { fill-opacity: 0; } ` : ''}${end}%, 88% { stroke-dashoffset: 0; opacity: 1;${filled ? ' fill-opacity: 1;' : ''} } 100% { stroke-dashoffset: 0; opacity: 0;${filled ? ' fill-opacity: 1;' : ''} }`;
    return [
      `        @keyframes ${key} { ${frames} }`,
      `        ${scope} [data-ira-line="${id}"] { stroke-dasharray: 1 1; animation: ${key} 2.65s cubic-bezier(.25,.65,.35,1) infinite; }`,
    ];
  });
  return ['<!-- Motion: trace each stroke from its own origin, accumulate the drawing, then hold before restarting. -->',
    '<style>', '    @media (prefers-reduced-motion: no-preference) {', ...rules, '    }', '</style>',
    `<g data-ira-stroke-reveal="${name}">${drawing}</g>`];
}
