import {icon, p, c, r, g} from '../geometry.mjs';
import {label, letterStrokes} from './lettering.mjs';
import {draw, appear, plan} from '../motion-plan.mjs';
const framed = (name,frame,detail,simple,sequence) => ({...icon(name,frame,detail,'pulse',simple+detail),sequence});
const write = (text,x,y,scale,end=63) => {
  const strokes = letterStrokes(text,x,y,scale);
  return strokes.map((stroke,j)=>draw(stroke,Math.round(j*end/strokes.length),Math.round((j+1)*end/strokes.length)));
};
const range = n => Array.from({length:n},(_,j)=>j);
const pips = [[],[[0,0]],[[-1,-1],[1,1]],[[-1,-1],[0,0],[1,1]],[[-1,-1],[1,-1],[-1,1],[1,1]],[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]];
const fill = body => `<g stroke="none" fill="currentColor">${body}</g>`;
function dots(n,x,y,dx,dy,radius) {
  return fill(pips[n].map(([a,b])=>c(x+a*dx,y+b*dy,radius)).join(''));
}
const countPips = (n,x,y,dx,dy,radius,start,step) => pips[n].map(([a,b],i) =>
  appear(fill(c(x+a*dx,y+b*dy,radius)),start+i*step,start+i*step+9));
const suits = {
  heart:p('M0 4C-8-1-3-7 0-3 3-7 8-1 0 4z'), diamond:p('M0-5 4 0 0 5-4 0z'),
  spade:p('M0-5C-7 1-4 4-1 2l-1 3h4L1 2c3 2 6-1-1-7z'),
  club:p('M-1-1c-5-7 7-7 2 0 6-3 6 6 0 3l1 3h-4l1-3c-6 3-6-6 0-3z'),
};
const clockPoint=(angle,len)=>[12+Math.sin(angle)*len,12-Math.cos(angle)*len].map(v=>+v.toFixed(2)).join(' ');
export const tabletopIcons = [
  ...range(31).map(j=>{
    const frame = r(3,5,18,16,2)+p('M7 3v4m10-4v4M3 10h18');
    return framed(`date-${j+1}`,frame,label(j+1,12,15.5,1.12),r(3,4,18,17,2),
      plan('Write the date digit by digit on a still calendar.',frame,write(j+1,12,15.5,1.12)));
  }),
  ...range(6).map(j=>{
    const frame = r(3,3,18,18,4);
    return framed(`die-face-${j+1}`,frame,dots(j+1,12,12,4.4,4.4,1.45),r(4,4,16,16,2),
      plan('Count in each pip without changing the value or the face.',frame,countPips(j+1,12,12,4.4,4.4,1.45,9,8)));
  }),
  ...range(7).flatMap(a=>range(7-a).map(d=>{
    const frame = r(2,5,20,14,3), divider = p('M12 8v8');
    const mark=dots(a,7.4,12,1.85,3.3,1)+dots(a+d,16.6,12,1.85,3.3,1);
    return framed(`domino-${a}-${a+d}`,frame,divider+mark,r(2,6,20,12,1),
      plan('Set the divider, then count pips from the left half to the right half.',frame,[draw(divider,0,17),
        ...countPips(a,7.4,12,1.85,3.3,1,19,4), ...countPips(a+d,16.6,12,1.85,3.3,1,19+4*a,4)]));
  })),
  ...Object.entries(suits).flatMap(([suit,mark])=>['A',2,3,4,5,6,7,8,9,10,'J','Q','K'].map(rank=>{
    const suitMark=g('translate(14 15.5) scale(.78)',mark);
    const x = rank===10?10.8:8.6, frame = r(4,2,16,20,2);
    return framed(`card-${suit}-${String(rank).toLowerCase()}`,frame,label(rank,x,7,.83)+suitMark,r(4,2,16,20),
      plan('Write the rank before tracing the suit, like marking a blank card.',frame,[...write(rank,x,7,.83,43),draw(suitMark,45,72)]));
  })),
  ...range(24).map(j=>{
    const h=Math.floor(j/2)||12, m=j%2?'30':'00';
    const hands=p(`M${clockPoint(j*Math.PI/12,4.4)}L12 12 ${clockPoint(j%2*Math.PI,7)}`);
    const frame = c(12,12,9.5)+p('M4 12h.5m15 0h.5');
    return framed(`dial-${h}-${m}`,frame,hands,c(12,12,9),
      plan('Draw each hand outward from the pivot, minute hand first.',frame,[
        draw(`M12 12L${clockPoint(j%2*Math.PI,7)}`,5,32),
        draw(`M12 12L${clockPoint(j*Math.PI/12,4.4)}`,34,60),
      ]));
  }),
  ...[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'].map(k=>{
    const frame = r(3,3,18,18,3)+p('M6 17.5h12');
    return framed(`keycap-${k.toLowerCase()}`,frame,label(k,12,10.5,1.5),r(4,3,16,16,2),
      plan(`Write ${k} on the keycap in pen-stroke order.`,frame,write(k,12,10.5,1.5)));
  }),
];
