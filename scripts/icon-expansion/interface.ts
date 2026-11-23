import { icon as i, g, p, c } from './geometry.ts';

const cardinal: [string, number][] = [['up', 0], ['right', 90], ['down', 180], ['left', 270]];
const turn = (d: string, angle: number) => g(`rotate(${angle} 12 12)`, d);
const arrow = 'M12 20V4m-6 6 6-6 6 6';
const compact = 'M12 19V5m-5 5 5-5 5 5';
const directional = (name: string, angle: number, d = arrow, mini = compact) =>
  i(name, turn(d, angle), '', 'trace', turn(mini, angle));

export const interfaceIcons = [
  directional('arrow-up', 0),
  directional('arrow-down', 180),
  ...[['up-left',-45],['up-right',45],['down-left',-135],['down-right',135]]
    .map(([name, angle]) => directional(`arrow-${name}`, Number(angle))),
  directional('arrow-up-down',0,'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4','M12 4v16M9 7l3-3 3 3m-6 10 3 3 3-3'),
  directional('arrow-left-right',90,'M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4','M12 4v16M9 7l3-3 3 3m-6 10 3 3 3-3'),
  ...[['up-left',1,1],['up-right',-1,1],['down-right',-1,-1],['down-left',1,-1]]
    .map(([name, x, y]) => {
      const flip = (d: string) => g(`translate(12 12) scale(${x} ${y}) translate(-12 -12)`, d);
      return i(`corner-${name}`, flip('M19 19v-5a3 3 0 0 0-3-3H5m5-5-5 5 5 5'), '', 'trace', flip('M19 18v-7H5m4-4-4 4 4 4'));
    }),
  ...cardinal.map(([dir,a]) => i(`arrow-to-${({ up:'top',down:'bottom' } as Record<string, string>)[dir] || dir}`,turn('M5 3h14',a),turn('M12 21V7m-4 4 4-4 4 4',a),'trace',turn('M6 4h12M12 20V8m-3 3 3-3 3 3',a))),
  ...cardinal.map(([dir,a]) => directional(`double-chevron-${dir}`,a,'m6 11 6-6 6 6m-12 8 6-6 6 6','m7 10 5-5 5 5m-10 8 5-5 5 5')),
  ...[['left','M4 9h11M4 15h9'],['center','M6.5 9h11M7.5 15h9'],['right','M9 9h11m-9 6h9'],['justify','M4 9h16M4 15h16']]
    .map(([side,d]) => i(`align-${side}`,'M4 4h16M4 20h16',d,'trace','M4 5h16M4 19h16'+d)),
  i('sort-ascending','M9 8h5m-5 5h8m-8 5h11','M5 19V5L2 8m3-3 3 3','trace','M4 18V6L2 8m2-2 2 2m4 1h4m-4 4h7m-7 4h10'),
  i('sort-descending','M9 7h11m-11 5h8m-8 5h5','M5 5v14l-3-3m3 3 3-3','trace','M4 6v12l-2-2m2 2 2-2m4-8h10m-10 4h7m-7 4h4'),
  directional('expand',0,'M14 4h6v6m0-6-6 6M10 20H4v-6m0 6 6-6','M15 4h5v5m0-5-5 5M9 20H4v-5m0 5 5-5'),
  directional('collapse',0,'M20 4l-6 6v-5m0 5h5M4 20l6-6H5m5 0v5','M19 5l-5 5V6m0 4h4M5 19l5-5H6m4 0v4'),
  directional('move',0,'M12 3v18M3 12h18M9 6l3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3','M12 4v16M4 12h16M10 6l2-2 2 2m-4 12 2 2 2-2M6 10l-2 2 2 2m12-4 2 2-2 2'),
  i('crosshair',c(12,12,7.5)+'<path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',c(12,12,2),'pulse',c(12,12,7)+p('M12 3v4m0 10v4M3 12h4m10 0h4')),
];
