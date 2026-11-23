import { SVGPathData, type SVGCommand } from 'svg-pathdata';
import { categoriesFor } from './categories.ts';
import { p } from './geometry.ts';

const fit = 'translate(1.5 1.5) scale(.875)';
const chartNames = /^(?:chart(?:-|$)|activity$|graph$|(?:device(?:-desktop)?|file|presentation|report)-analytics$|file-chart$)/;
const tableNames = /^(?:table(?:-|$)|file-spreadsheet$|columns?$|column-(?:insert|remove)|row-(?:insert|remove)|freeze-(?:row|column)$|grid(?:$|-(?:3x3|4x4|goldenratio)$))/;
const radialCharts = /^chart-(?:arcs|donut|pie|radar)(?:-|$)/;
const segmentedCircles = /^circle-(?:dashed|dotted)$/;
const axes = new Set(['M3 3v18h18', 'M3 4v16h18', 'M4 19l16 0']);
const precision = (n: number) => Number(n.toFixed(5));
const draw = (d: string, kind = 'line') => `<path data-design-ink="${kind}" pathLength="1" d="${d}"/>`;
const group = (kind: string, body: string) => `<g data-design-ink="${kind}">${body}</g>`;

function ring(x: number, y: number, r: number) {
  return draw(`M${x} ${precision(y-r)}a${r} ${r} 0 1 1 0 ${precision(2*r)}a${r} ${r} 0 1 1 0 ${precision(-2*r)}z`, 'ring');
}

// Only accept a complete circle made of two true semicircles. Leave arcs,
// ellipses and compound silhouettes in their original form.
function ringFromPath(d: string) {
  const commands = new SVGPathData(d).toAbs().commands.filter(cmd => cmd.type !== SVGPathData.CLOSE_PATH);
  const [start, a, b] = commands.slice(-3);
  if (start?.type !== SVGPathData.MOVE_TO || a?.type !== SVGPathData.ARC || b?.type !== SVGPathData.ARC ||
      commands.slice(0,-3).some(cmd => cmd.type !== SVGPathData.MOVE_TO)) return;
  const r = a.rX;
  const near = (x: number, y: number) => Math.abs(x-y) < .0001;
  if (r <= 0 || !near(a.rY,r) || !near(b.rX,r) || !near(b.rY,r) || a.sweepFlag !== b.sweepFlag ||
      !near(start.x,b.x) || !near(start.y,b.y) || !near(Math.hypot(a.x-b.x,a.y-b.y),2*r)) return;
  return ring(precision((a.x+b.x)/2), precision((a.y+b.y)/2), r);
}

function normalizeRings(body: string) {
  return body.replace(/<path d="([^"]+)"\s*\/>/g, (tag, d) => ringFromPath(d) ?? tag)
    .replace(/<circle\s+([^>]+)\/>/g, (tag, attrs: string) => {
      if (!/^(?:(?:cx|cy|r)="[-.\d]+"\s*){3}$/.test(attrs)) return tag;
      const numbers = Object.fromEntries([...attrs.matchAll(/(cx|cy|r)="([^"]+)"/g)].map(([,key,value]) => [key,Number(value)]));
      return numbers.r > 0 && Number.isFinite(numbers.cx) && Number.isFinite(numbers.cy) ? ring(numbers.cx,numbers.cy,numbers.r) : tag;
    });
}

// A split compound stroke (e.g. a plus or X) starts each line at an endpoint.
type Order = 'together' | 'chart' | 'table';
const band = (at: number) => at < 9 ? 0 : at < 15 ? 1 : 2;
function drawLines(d: string, order: Order) {
  const paths: SVGCommand[][] = [];
  for (const cmd of new SVGPathData(d).toAbs().normalizeHVZ(false).commands) {
    if (cmd.type === SVGPathData.MOVE_TO) paths.push([cmd]);
    else paths.at(-1)!.push(cmd);
  }
  return paths.filter(path => path.length > 1).map(path => {
    const stroke = new SVGPathData(path);
    if (order === 'together') return draw(stroke.encode());
    const {minX, minY, maxX, maxY} = stroke.getBounds();
    const first = path[0], last = path.at(-1)!;
    // A series reads from left to right; a vertical bar grows from its base.
    // Table rules instead read left to right and top to bottom.
    if ('x' in first && 'y' in first && 'x' in last && 'y' in last && (first.x > last.x ||
        (first.x === last.x && (order === 'chart' ? first.y < last.y : first.y > last.y)))) stroke.reverse();
    const short = maxX-minX < 8 && maxY-minY < 18;
    const layer = order === 'table' ? `row-${band(minY)}` : short ? `sample-${band(minX)}` : 'line';
    return draw(stroke.encode(),layer);
  }).join('');
}
const drawUnmarkedPaths = (body: string, order: Order = 'together') => body
  .replace(/<path d="([^"]+)"\s*\/>/g, (_, d) => drawLines(d,order))
  .replace(/<(line|polyline|rect)\b([^>]*)/g, (_, tag, attrs: string) => {
    const y = Number(attrs.match(/\by="([^\"]+)"/)?.[1] ?? 0);
    const layer = order === 'table' ? `row-${band(y)}` : 'line';
    return `<${tag} data-design-ink="${layer}" pathLength="1"${attrs}`;
  });

// Keep one vertex per passed corner at every keyframe so CSS can interpolate.
function sector(angle: number) {
  const edge = (degrees: number) => {
    const x = Math.sin(degrees*Math.PI/180), y = -Math.cos(degrees*Math.PI/180);
    const scale = 50/Math.max(Math.abs(x), Math.abs(y));
    return `${precision(50+x*scale)}% ${precision(50+y*scale)}%`;
  };
  return `polygon(50% 50%, 50% 0%, ${[45,135,225,315,360].map(corner => edge(Math.min(corner,angle))).join(', ')})`;
}

const series: Record<string, [string, string, string?]> = {
  activity: ['', 'M2 13h4l3-9 6 16 3-9h4'],
  'chart-line': ['M3 4v16h18', 'M7 15l4-5 4 2 6-7'],
  'chart-ppf': ['M3 3v18h18', 'M7 6C13.627 6 19 10.925 19 17', fit],
  graph: ['M4 18v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z', 'M7 14l3 -3l2 2l3 -3l2 2', fit],
};

function chart(name: string, body: string) {
  if (Object.hasOwn(series,name)) {
    const [frame, d, transform] = series[name];
    const markup = (frame ? p(frame) : '') + draw(d);
    return transform ? `<g transform="${transform}">${markup}</g>` : markup;
  }
  if (name === 'chart-bar') return p('M3 4v16h18') + drawLines('M8 16v-5m5 5V5m5 11V9','chart');
  if (radialCharts.test(name)) return drawUnmarkedPaths(normalizeRings(body));
  const fixed: string[] = [];
  const data = body.replace(/(<g transform="translate\(1\.5 1\.5\) scale\(\.875\)">)?(<path d="([^"]+)"\s*\/>)/g,
    (tag, opening, path, d) => {
      if (!axes.has(d)) return tag;
      fixed.push(opening ? `${opening}${path}</g>` : path);
      return opening ?? '';
    });
  return fixed.join('') + drawUnmarkedPaths(normalizeRings(data),'chart');
}

export function designRevealFor(name: string, body: string) {
  if (/^grid-area-/.test(name)) return;
  if (chartNames.test(name)) return render(name,'chart',chart(name,body));
  if (name === 'table') {
    // Give the header and the two rows separate starts at the real dividers.
    return render(name,'table',
      '<rect data-design-ink="row-0" pathLength="1" width="18" height="16" x="3" y="4" rx="2"/>' +
      draw('M3 9H21','row-0') + draw('M3 14.5H21','row-1') + draw('M10 9V20','row-1'));
  }
  if (tableNames.test(name)) return render(name,'table',drawUnmarkedPaths(normalizeRings(body),'table'));
  if (!/^circles?(?:-|$)/.test(name) && !categoriesFor(name).some(id => /^(?:design|data|grids)$/.test(id))) return;
  if (segmentedCircles.test(name)) return render(name,'circle',group('radial',body));
  const rings = normalizeRings(body);
  if (rings === body) return;
  return render(name,'circle',drawUnmarkedPaths(rings));
}

function render(name: string, kind: 'chart' | 'circle' | 'table', body: string) {
  const duration = kind === 'chart' ? '2.8s' : '2.4s';
  const scope = `[data-ira-design-reveal="${name}"]`;
  const rules: string[] = [];
  const rule = (ink: string, frames: string, speed = 'linear', extra = '') => {
    if (!body.includes(`data-design-ink="${ink}"`)) return;
    const key = `ira-design-${name}-${ink}`;
    rules.push(`        @keyframes ${key} { ${frames} }`,
      `        ${scope} [data-design-ink="${ink}"] { ${extra}animation: ${key} ${duration} ${speed} infinite; }`);
  };
  const trace = (ink: string, start: number, end: number) => rule(ink,
    `${start ? `0%, ${start}%` : '0%'} { stroke-dashoffset: 1; opacity: 0; } ${start+1}% { opacity: 1; } ${end}%, 87% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; }`,
    'linear','stroke-dasharray: 1 1; ');
  trace('line',0,49);
  trace('ring',0,49);
  for (let i = 0; i < 3; i++) {
    trace(`sample-${i}`,i*12,24+i*12);
    trace(`row-${i}`,i*12,30+i*12);
  }
  const radialFrames = [0,45,135,225,315,360].map(angle =>
    `${angle === 360 ? '49%, 87%' : precision(49*angle/360)+'%'} { clip-path: ${sector(angle)};${angle === 0 ? ' opacity: 0;' : angle === 360 ? ' opacity: 1;' : ''} }`).join(' ');
  rule('radial',`${radialFrames} 1% { opacity: 1; } 100% { clip-path: ${sector(360)}; opacity: 0; }`,'linear','transform-box: view-box; ');
  return ['<style>', '    @media (prefers-reduced-motion: no-preference) {', ...rules, '    }', '</style>',
    `<g data-ira-design-reveal="${name}" data-design-kind="${kind}">${body}</g>`];
}
