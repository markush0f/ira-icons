import { icon as i, p, c, r } from './geometry.mjs';

const file = 'M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8 0v5h5';
const simpleFile = 'M5 3h9l5 5v13H5z';
const folder = 'M3 6a2 2 0 0 1 2-2h4l3 3h7a2 2 0 0 1 2 2v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z';
const simpleFolder = 'M3 5h6l3 3h9v12H3z';
const actions = [
  ['plus','M12 10v6m-3-3h6','trace'],
  ['minus','M9 13h6','trace'],
  ['check','m9 13 2 2 4-4','trace'],
  ['x','m10 11 4 4m0-4-4 4','trace'],
  ['up','M12 16v-6m-2.5 2.5L12 10l2.5 2.5','rise'],
  ['down','M12 10v6m-2.5-2.5L12 16l2.5-2.5','drop'],
  ['search',c(11.5,12.5,2.5)+p('m13.3 14.3 2.2 2.2'),'nudge'],
  ['lock',r(9,12,6,4,1)+p('M10.5 12v-1.5a1.5 1.5 0 0 1 3 0V12'),'pulse'],
  ['heart','M12 16l-2.5-2.5c-2.5-2.5.5-4.5 2.5-2 2-2.5 5-.5 2.5 2z','beat'],
  ['star','m12 9 1 2.5 2.7.2-2 1.8.6 2.7-2.3-1.4-2.3 1.4.6-2.7-2-1.8 2.7-.2z','spark'],
];
const formats = [
  ['code','m10.5 11-2 2 2 2m3-4 2 2-2 2','trace'],
  ['image',p('m8.5 16 2.6-3 2 2 1.1-1.3 1.8 2.3')+c(14.5,11,0.7),'pulse'],
  ['audio','M11 15v-5l4-1v5m-4 1c0 1-2 1.5-2 .5s2-1.5 2-.5m4-1c0 1-2 1.5-2 .5s2-1.5 2-.5','bob'],
  ['video','m10 9 6 4-6 4z','pulse'],
  ['zip','M11 9h2m-1 3h2m-3 3h2m-1 3h2','drop'],
  ['spreadsheet',r(8.5,10,7,6,0.5)+p('M12 10v6m-3.5-3h7'),'pulse'],
  ['chart','M9 16v-2m3 2v-5m3 5v-7','bars'],
];
const clip = r(5,5,14,16,2)+r(9,3,6,4,1);
export const fileIcons = [
  ...[['file',file,simpleFile],['folder',folder,simpleFolder]].flatMap(([type,outline,min]) =>
    actions.map(([action,mark,motion]) => i(`${type}-${action}`,outline,mark,motion,p(min)+(mark.startsWith('<')?mark:p(mark))))),
  ...formats.map(([name,mark,motion]) => i(`file-${name}`,file,mark,motion,p(simpleFile)+(mark.startsWith('<')?mark:p(mark)))),
  i('clipboard',clip,'M9 11h6m-6 4h4','trace',r(5,5,14,16,1)+p('M9 3h6v4H9z')),
  i('clipboard-list',clip,'M9 11h.01m3 0h4m-7 4h.01m3 0h4m-7 4h.01m3 0h4','trace',p('M5 5h4V3h6v2h4v16H5zM8 11h8m-8 4h8m-8 4h8')),
  i('folder-tree',folder,'M8 10v7h7m-7-4h5','trace','M3 5h6l3 3h9v12H3zm5 6v5h7'),
];
