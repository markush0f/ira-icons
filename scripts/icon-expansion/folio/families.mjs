import {readFileSync} from 'node:fs';
import rows from './tabler.json' with {type:'json'};
import {p,c,r,g,icon} from '../geometry.mjs';
import {handDirected} from './hand-directed.mjs';

export const tablerNotice='Adapted from Tabler Icons 3.34.1.\n'+readFileSync(new URL('./TABLER-LICENSE.txt',import.meta.url),'utf8').trim();
// Fit the same optical margin around each pictogram, preserving its proportions.
// A lighter pen opens counters in minimalist mode; never drop a semantic stroke.
const fit=body=>g('translate(1.5 1.5) scale(.875)',body);
const pen=(width,body)=>`<g stroke-width="${width}">${body}</g>`;
const adapted=rows.map(([category,name,paths])=>{
  const lines=paths.map(p), last=lines.at(-1), fixed=lines.slice(0,-1).join('');
  const custom = Object.hasOwn(handDirected,name) ? handDirected[name](paths) : null;
  const sequence = custom && {...custom, fixed: custom.fixed && fit(custom.fixed), steps: custom.steps.map(step=>({...step,body:fit(step.body.startsWith('<') ? step.body : p(step.body))}))};
  return {...icon(name,fit(fixed||last),fixed?fit(last):null,'pulse',fit(pen(1.45,lines.join('')))),category,notice:tablerNotice,sequence};
});

// Northern hemisphere wind barbs. The staff points toward the source of the wind;
// a pennant = 50 knots, a long barb = 10, a half barb = 5.
const winds=[];
const compass='n nne ne ene e ese se sse s ssw sw wsw w wnw nw nnw'.split(' ');
for(let j=0;j<16;j++)for(let speed=5;speed<=100;speed+=5){
  let flags='', y=speed===5?7.3:5.2, remaining=speed;
  while(remaining>=50){flags+=`<path d="M12 ${y}l4.8 -1.6 -4.8 4.8z" fill="currentColor" stroke-width=".8"/>`;y+=3.8;remaining-=50;}
  while(remaining>=10){flags+=p(`M12 ${y}l4.8 -2.6`);y+=1.95;remaining-=10;}
  if(remaining)flags+=p(`M12 ${y}l2.5 -1.35`);
  const rot=body=>g(`rotate(${j*22.5} 12 12)`,body);
  const shaft=p('M12 5.2V17.5'), station=c(12,19,1.6);
  const flag=rot(pen(1.25,flags));
  winds.push({...icon(`wind-barb-${compass[j]}-${speed}kt`,rot(pen(1.5,shaft+station)),flag,'pulse',rot(pen(1.4,p('M12 5.2V20')))+flag),category:'Wind barbs'});
}

// Every contiguous selection in a four-by-four layout grid, indexed from 1.
const grids=[];
const frame=r(2.5,2.5,19,19,2);
const guides=pen(.75,p('M7.25 3v18M12 3v18m4.75-18v18M3 7.25h18M3 12h18M3 16.75h18'));
for(let y=0;y<4;y++)for(let x=0;x<4;x++)for(let h=1;h<=4-y;h++)for(let w=1;w<=4-x;w++){
  const mark=`<g fill="currentColor" stroke="none">${r(3.5+x*4.75,3.5+y*4.75,w*4.75-2,h*4.75-2,.7)}</g>`;
  grids.push({...icon(`grid-area-r${y+1}-c${x+1}-${w}x${h}`,pen(1.3,frame)+guides,mark,'pulse',pen(1.1,frame)+mark),category:'Grid layout'});
}
export const folioIcons=[...adapted,...winds,...grids];
