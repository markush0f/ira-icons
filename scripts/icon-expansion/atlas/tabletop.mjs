import {icon, p, c, r, g} from '../geometry.mjs';
import {label} from './lettering.mjs';
const framed = (name,frame,detail,simple) => icon(name,frame,detail,'pulse',simple+detail);
const range = n => Array.from({length:n},(_,j)=>j);
const pips = [[],[[0,0]],[[-1,-1],[1,1]],[[-1,-1],[0,0],[1,1]],[[-1,-1],[1,-1],[-1,1],[1,1]],[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]];
function dots(n,x,y,dx,dy,radius) {
  return `<g stroke="none" fill="currentColor">${pips[n].map(([a,b])=>c(x+a*dx,y+b*dy,radius)).join('')}</g>`;
}
const suits = {
  heart:p('M0 4C-8-1-3-7 0-3 3-7 8-1 0 4z'), diamond:p('M0-5 4 0 0 5-4 0z'),
  spade:p('M0-5C-7 1-4 4-1 2l-1 3h4L1 2c3 2 6-1-1-7z'),
  club:p('M-1-1c-5-7 7-7 2 0 6-3 6 6 0 3l1 3h-4l1-3c-6 3-6-6 0-3z'),
};
const clockPoint=(angle,len)=>[12+Math.sin(angle)*len,12-Math.cos(angle)*len].map(v=>+v.toFixed(2)).join(' ');
export const tabletopIcons = [
  ...range(31).map(j=>framed(`date-${j+1}`,r(3,5,18,16,2)+p('M7 3v4m10-4v4M3 10h18'),label(j+1,12,15.5,1.12),r(3,4,18,17,2))),
  ...range(6).map(j=>framed(`die-face-${j+1}`,r(3,3,18,18,4),dots(j+1,12,12,4.4,4.4,1.45),r(4,4,16,16,2))),
  ...range(7).flatMap(a=>range(7-a).map(d=>{
    const mark=dots(a,7.4,12,1.85,3.3,1)+dots(a+d,16.6,12,1.85,3.3,1);
    return framed(`domino-${a}-${a+d}`,r(2,5,20,14,3),p('M12 8v8')+mark,r(2,6,20,12,1));
  })),
  ...Object.entries(suits).flatMap(([suit,mark])=>['A',2,3,4,5,6,7,8,9,10,'J','Q','K'].map(rank=>{
    const suitMark=g('translate(14 15.5) scale(.78)',mark);
    return framed(`card-${suit}-${String(rank).toLowerCase()}`,r(4,2,16,20,2),label(rank,rank===10?10.8:8.6,7,.83)+suitMark,r(4,2,16,20));
  })),
  ...range(24).map(j=>{
    const h=Math.floor(j/2)||12, m=j%2?'30':'00';
    const hands=p(`M${clockPoint(j*Math.PI/12,4.4)}L12 12 ${clockPoint(j%2*Math.PI,7)}`);
    return framed(`dial-${h}-${m}`,c(12,12,9.5)+p('M4 12h.5m15 0h.5'),hands,c(12,12,9));
  }),
  ...[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'].map(k=>framed(`keycap-${k.toLowerCase()}`,r(3,3,18,18,3)+p('M6 17.5h12'),label(k,12,10.5,1.5),r(4,3,16,16,2))),
];
