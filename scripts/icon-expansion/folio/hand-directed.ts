import { p } from '../geometry.ts';
import { draw, appear, move, plan } from '../motion-plan.ts';

// These are explicit shot lists, not path-order heuristics. Indices refer to Tabler geometry.
export const handDirected: Record<string, (paths: string[]) => ReturnType<typeof plan>> = {
  ai: ([a,bar]) => plan('Draw the A from its left foot, cross it, then write the I from bottom to top.', '', [
    draw(a,0,26), draw(bar,26,37), draw('M16 16V8',39,65),
  ]),
  'a-b': () => plan('Write A and cross it, draw the separator upwards, then add the spine and the two bowls of B.', '', [
    draw('M3 16v-5.5a2.5 2.5 0 0 1 5 0v5.5',0,18), draw('M3 12h5',18,25),
    draw('M12 18V6',26,35), draw('M16 16V8',36,45), draw('M16 8h3a2 2 0 0 1 0 4h-3',45,57),
    draw('M19 12a2 2 0 0 1 0 4h-3',58,71),
  ]),
  abc: ([a, bar, b, c]) => plan('Handwrite A, cross it, then write b and c from left to right.', '', [
    draw(a,0,18), draw(bar,18,26), draw(b,28,49), draw(c,50,72),
  ]),
  checks: ([front]) => plan('Confirm the left check, then the front check; reveal the overlapping upper leg last.', '', [
    draw('M2 12l5 5',0,14), draw(front,14,49), draw('M12 12l5 -5',37,58),
  ]),
  'circle-check': ([ring, check]) => plan('Draw the check inside the still circle, from short arm to long arm.', p(ring), [draw(check,12,58)]),
  'heart-rate-monitor': ([screen,desk,left,right,signal]) => plan('Trace one ECG beat across the screen; the monitor and stand stay anchored.', [screen,desk,left,right].map(p).join(''), [draw(signal,6,64,'linear')], 2.8),
  'camera-plus': ([body, h, v, lens]) => plan('Close the lens ring, then draw both bars of the plus sign together.', p(body), [draw(lens,5,36), draw(p(h)+p(v),39,59)]),
  'bell-ringing': ([bell, clapper, right, left]) => plan('The bell settles from a swing while a wave blooms on each side.', '', [
    move(p(bell)+p(clapper),0,32,'transform: rotate(-7deg);','cubic-bezier(.22, 1.65, .65, 1)'),
    appear(p(right)+p(left),18,40),
  ]),
  alarm: ([ring,hand,left,right]) => plan('Build the two bells together, then draw the clock hand from its center toward the hour mark.', p(ring), [
    draw(p(left)+p(right),0,20), draw('M12 13v-3',21,45), draw('M12 13h2',34,57),
  ]),
  'player-play': ([triangle]) => plan('The play button pushes forward slightly, keeping a closed triangle.', '', [move(triangle,5,35,'transform: translateX(-1.25px);')],2.6),
};