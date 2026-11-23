import { SVGPathData } from 'svg-pathdata';
import {g, p} from '../geometry.mjs';

// A single-stroke alphabet on a 4 × 6 grid. No font dependencies in exported SVGs.
const alphabet = {
  A:'M0 6l2-6 2 6M1 4h2', B:'M0 6V0h2a1.5 1.5 0 0 1 0 3H0h2a1.5 1.5 0 0 1 0 3z', C:'M4 1Q0-2 0 3t4 2', D:'M0 0h1q3 0 3 3t-3 3H0z', E:'M4 0H0v6h4M0 3h3', F:'M4 0H0v6m0-3h3', G:'M4 1Q0-2 0 3t4 2V3H2', H:'M0 0v6m4-6v6M0 3h4', I:'M0 0h4M2 0v6M0 6h4', J:'M1 0h3v4q0 4-4 1', K:'M0 0v6m4-6L0 3l4 3', L:'M0 0v6h4', M:'M0 6V0l2 3 2-3v6', N:'M0 6V0l4 6V0', O:'M2 0Q0 0 0 3t2 3 2-3-2-3z', P:'M0 6V0h2a1.75 1.75 0 0 1 0 3.5H0', Q:'M2 0Q0 0 0 3t2 3 2-3-2-3zM2.5 4.5 4.5 6.5', R:'M0 6V0h2a1.5 1.5 0 0 1 0 3H0m2 0 2 3', S:'M4 1C1-2-2 2 2 3s2 5-2 2', T:'M0 0h4M2 0v6', U:'M0 0v4a2 2 0 0 0 4 0V0', V:'M0 0l2 6 2-6', W:'M0 0l.5 6L2 3l1.5 3L4 0', X:'M0 0l4 6m0-6L0 6', Y:'M0 0l2 3 2-3M2 3v3', Z:'M0 0h4L0 6h4',
  0:'M2 0Q0 0 0 3t2 3 2-3-2-3zM1 4l2-2', 1:'M.5 1.5 2 0v6M.5 6h3', 2:'M0 1Q1-1 3 0t0 3L0 6h4', 3:'M0 .5Q4-1 4 1q0 2-3 2 3 0 3 1.5T0 5.5', 4:'M3 6V0L0 4h4', 5:'M4 0H.5v2.8Q4 2 4 4.3T0 5.5', 6:'M3.5 0Q0 1 0 4a2 2 0 1 0 1-1.7L0 3', 7:'M0 0h4L1 6', 8:'M2 3C-.5 3-.5 0 2 0s2.5 3 0 3c-2.7 0-2.7 3 0 3s2.7-3 0-3z', 9:'M.5 6Q4 5 4 2a2 2 0 1 0-1 1.7L4 3',
};
// Split actual pen lifts, after resolving relative moves to absolute positions.
export function letterStrokes(text, x, y, scale) {
  const chars = [...String(text)];
  return chars.flatMap((ch,j) => {
    const commands = new SVGPathData(ch === 'I' ? 'M0 6h4M2 6V0M0 0h4' : alphabet[ch]).toAbs().commands;
    const segments = [];
    for (const command of commands) {
      if (command.type === SVGPathData.MOVE_TO) segments.push([]);
      segments.at(-1).push(command);
    }
    return segments.map(segment => g(`translate(${x} ${y}) scale(${scale}) translate(${-2-(chars.length-1)*3.25+j*6.5} -3)`,
      `<g stroke-width="1.25">${p(SVGPathData.encode(segment))}</g>`));
  });
}
export function label(text, x, y, scale) {
  const chars = [...String(text)];
  const strokes = chars.map((ch,j)=>g(`translate(${j*6.5} 0)`,p(alphabet[ch]))).join('');
  return g(`translate(${x} ${y}) scale(${scale}) translate(${-2-(chars.length-1)*3.25} -3)`,`<g stroke-width="1.25">${strokes}</g>`);
}
