import {icon, p, c, r, g} from '../geometry.ts';

// Frame, simplified silhouette, and the actual usable centre of the display.
const panels = {
  wristwatch: [r(5,6,14,12,3)+p('M8 6l1-4h6l1 4m-8 12 1 4h6l1-4'),p('M8 6V3h8v3m-8 12v3h8v-3')+r(5,6,14,12,2),12,12,.82],
  handset: [r(5,2,14,20,3)+p('M10 5h4m-3 14h2'),r(6,2,12,20,2),12,12,.94],
  slate: [r(2,4,20,16,2)+p('M18 7v10'),r(2,4,20,16,1),10,12,1],
  workstation: [r(2,3,20,14,2)+p('M12 17v4m-5 0h10'),p('M2 3h20v14H2zm10 14v4m-4 0h8'),12,10,1],
  notebook: [p('M5 16V5q0-1 1-1h12q1 0 1 1v11m-17 1h20l-2 3H4z'),p('M5 5h14v12H5zm-3 14h20'),12,10.5,.9],
  terminal: [r(4,2,16,20,2)+p('M4 16h16m-13 3h2m3 0h4'),r(4,2,16,20,1)+p('M5 16h14'),12,9,1],
  browser: [r(2,3,20,18,2)+p('M2 8h20M5 5.5h.1m3 0h.1'),r(2,3,20,18,1)+p('M3 7h18'),12,14.3,.95],
  inbox: [p('M2 15l3-11h14l3 11v5H2zm0 0h6l2 2h4l2-2h6'),p('M2 16l3-12h14l3 12v4H2z'),12,10,.82],
  message: [p('M5 3h14q2 0 2 2v10q0 2-2 2h-7l-6 4v-4H5q-2 0-2-2V5q0-2 2-2z'),p('M3 4h18v13h-9l-6 4v-4H3z'),12,10,1],
  clipboard: [r(4,5,16,17,2)+r(8,2,8,5,2),p('M4 5h4V3h8v2h4v16H4z'),12,14,.98],
};
const states = {
  accepted:p('M-4 0l3 3 5-6'), rejected:p('M-3-3l6 6m0-6-6 6'), pending:c(0,0,4)+p('M0-2v2l2 1'),
  warning:p('M0-4v5m0 3h.01'), protected:p('M0-5l4 2v3q0 3-4 5-4-2-4-5v-3z'),
  synced:p('M-4-1q1-5 7-2l1 1m0-3v3H1M4 1q-1 5-7 2l-1-1m0 3V2h3'),
  incoming:p('M0-4v8m-3-3 3 3 3-3'), outgoing:p('M0 4v-8m-3 3 3-3 3 3'),
  favorite:p('M0 4l-4-4c-2-4 2-6 4-3 2-3 6-1 4 3z'), private:r(-4,-.5,8,5,1)+p('M-2.5-.5v-2a2.5 2.5 0 0 1 5 0v2'),
};
const transports = {
  start:p('M-3-4 4 0l-7 4z'), pause:p('M-2-4v8m4-8v8'), stop:r(-3,-3,6,6,.5), record:c(0,0,3.3),
  next:p('M-4-4 2 0l-6 4zM4-4v8'), previous:p('M4-4-2 0l6 4zM-4-4v8'),
  forward:p('M-5-3l4 3-4 3zM1-3l4 3-4 3z'), rewind:p('M5-3 1 0l4 3zM-1-3l-4 3 4 3z'),
  eject:p('M-4 1l4-5 4 5zm0 3h8'), loop:p('M-4 0v-2h7l-2-2m3 4v2h-7l2 2'),
  louder:p('M-4 0h8M0-4v8'), quieter:p('M-4 0h8'), mute:p('M-5-1h2l2-2v6l-2-2h-2zm8-1 3 4m0-4L3 2'),
  captions:p('M-1-2q-4-2-4 2t4 2m6-4q-4-2-4 2t4 2'), queue:p('M-4-3h8m-8 3h8m-8 3h4'), levels:p('M-4-1v2m3-5v8m3-6v4m3-3v2'),
};
const surfaces = {
  remote:[r(5,2,14,20,4)+p('M9 17h6m-5 2.5h4'),r(5,2,14,20,2),12,10,.87],
  player:[r(2,3,20,18,2)+p('M5 17h14m-10-1v2'),r(2,4,20,16,2),12,10,1],
  softkey:[r(2,5,20,14,4)+p('M6 16h12'),r(3,5,18,13,2),12,10.8,.84],
  jogwheel:[c(12,12,10)+p('M10 4.8q2-.7 4 0'),c(12,12,8.8),12,12.5,1],
};
function engrave(frames: Record<string, (string | number)[]>,marks: Record<string, string>) {
  return Object.entries(frames).flatMap(([frame,[outline,simple,x,y,s]])=>Object.entries(marks).map(([key,glyph])=>{
    const detail=g(`translate(${x} ${y}) scale(${s})`,glyph);
    return icon(`${frame}-${key}`,String(outline),detail,'pulse',simple+detail);
  }));
}
export const panelIcons = [...engrave(panels,states),...engrave(surfaces,transports)];
