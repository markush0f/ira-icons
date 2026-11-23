import {icon, p, c, r, g} from '../geometry.mjs';

// Local coordinates -5..5. Keep each pictogram upright even on left-pointing signs.
const places = {
  campsite: p('M-5 4 0-4l5 8zM-2 4l2-3 2 3'),
  fountain: p('M-5 2q5 6 10 0zM0 2v-5q-3-3-4 1M0-1q2-4 4-2'),
  library: p('M0-3q-2-2-5-1v8q3-1 5 1 2-2 5-1v-8q-3-1-5 1zm0 0v8'),
  museum: p('M-5-2 0-5l5 3zM-3 0v3m3-3v3m3-3v3M-5 5H5'),
  cafe: p('M-4-3h7v4q0 3-3 3h-1q-3 0-3-3zm7 1h1a2 2 0 0 1-1 4'),
  bakery: p('M-4 4v-5q-3-2 0-4 2-1 4 0 2-1 4 0 3 2 0 4v5z'),
  picnic: p('M-4-3h8M-2-3l-2 8m6-8 2 8M-5 1H5'),
  restroom: p('M-5 0h10q-1 5-5 5t-5-5zM-4 0v-4h3v4'),
  lookout: p('M-5 0q5-8 10 0-5 8-10 0z')+c(0,0,1),
  trailhead: p('M0 5V-5m0 1h4l1 2-1 1H0m0 1h-4l-1 2 1 1h4'),
  shelter: p('M-5-1 0-5l5 4M-4-1v6m8-6v6M-2 2h4'),
  orchard: c(0,-2,3.5)+p('M0 2v3m-3 0h6'),
  ferry: p('M-5 1 0-1l5 2-2 3h-6zM-3 0v-4h6v4'),
  metro: r(-4,-5,8,8,2)+p('M-4-1h8M-2 3l-2 2m6-2 2 2'),
  runway: p('M-5 5-2-5h4L5 5M0 0v1m0 3v1'),
  lighthouse: p('M-3 5l1-7h4l1 7zm1-7v-2l2-1 2 1v2M-5 5H5'),
  beach: p('M-5 0a5 5 0 0 1 10 0zm5 0v5m-2 0h4'),
  summit: p('M-5 4 0-5l5 9zm3-5 2 1 2-1'),
  cave: p('M-5 4q0-9 5-9t5 9H2q0-5-2-5t-2 5z'),
  waterfall: p('M-5-4h4q2 0 2 2v4M-5-1h2q1 0 1 2v1M-4 4q2-1 4 0t5 0'),
  pharmacy: p('M-2-5h4v3h3v4H2v3h-4V2h-3v-4h3z'),
  parking: p('M-2 5V-5h3a3 3 0 0 1 0 6h-3'),
  fuel: r(-4,-5,5,10,1)+p('M-4-1h5m0 1h1q1 0 1 2t2 0v-5l-2-2'),
  charging: p('M1-5-4 1h4l-1 4 5-6H0z'),
  dining: p('M-4-5v4q2 3 4 0v-4m-2 0V5m6 0V-5q-3 2-2 6h2'),
  lodging: p('M-5-3v8m0-3H5v3M-5-1h3v3m0-4h5q2 0 2 2v2'),
  swimming: p('M-5 1q2-2 4 0t4 0l2-1M-5 4q2-2 4 0t4 0l2-1M-3-1l3-3 2 2')+c(4,-3,1),
  theater: p('M-5-4q5 2 10 0v4q0 3-5 5-5-2-5-5zm2 3h1m4 0h1m-5 3q2 2 4 0'),
  gallery: r(-5,-4,10,8,1)+p('M-5 3l3-4 3 3 2-2 2 2'),
  stadium: p('M-5-2q5-5 10 0v5q-5 4-10 0zm0 0q5 4 10 0'),
  lockers: r(-4,-5,8,10,1)+p('M-2-2h4m-4 3v1'),
  information: p('M-2-1h2v6m-2 0h4')+c(0,-4,.55),
};
const plate = r(3,3,18,18,4), pin = p('M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z');
export const placeIcons = Object.entries(places).flatMap(([name,shape]) => {
  const at = (x,y,scale) => g(`translate(${x} ${y}) scale(${scale})`,`<g stroke-width="1.55">${shape}</g>`);
  const make = (name,frame,mark,small) => icon(name,frame,mark,'pulse',small+mark);
  return [make(`amenity-${name}`,plate,at(12,12,1.18),''),
    make(`locator-${name}`,pin,at(12,10,.88),p('M19 10c0 4-7 11-7 11S5 14 5 10a7 7 0 1 1 14 0z')),
    make(`station-${name}`,p('M4 3h16v14H4zm3 14v4m10-4v4'),at(12,10,.9),r(4,3,16,14,1)),
    ...['west','east'].map((dir,j)=>{
      const board = p(j?'M3 4h13l5 6-5 6H3z':'M21 4H8l-5 6 5 6h13z');
      return make(`sign-${dir}-${name}`,board+p('M11 16v5h2v-5'),at(j?10:14,10,.85),board);
    })];
});
