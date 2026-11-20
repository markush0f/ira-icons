import { icon as i, p, c, r, g } from './geometry.mjs';

const wheels = c(7,18,2)+c(17,18,2);
const car = 'M3 17v-5l3-2 2-5h8l2 5 3 2v5h-2m-4 0H9m-4 0H3zm3-7h12';
const cabin = r(5,3,14,15,3)+p('M7 21l3-3m7 3-3-3M5 11h14');
const turn = (angle, d) => g(`translate(12 12) rotate(${angle}) scale(.8) translate(-12 -12)`, d);
const plane = 'M12 2.5q1.5 0 1.5 2v5l7.5 5v2l-7.5-2.5V19l2.5 2h-2l-2-1-2 1H8l2.5-2v-4.5L3 17v-2l7.5-5.5v-5q0-2 1.5-2z';
const miniPlane = 'M12 3v18m-3 0 3-2 3 2M3 15l9-5 9 5';

export const travelIcons = [
  i('car',p(car)+wheels,'M5.5 13.5h2m9 0h2','pulse',p('M3 17v-5l3-2 2-5h8l2 5 3 2v5H3zm3-7h12')+c(7,18,1.5)+c(17,18,1.5)),
  i('taxi',p(car)+wheels,'M9.5 5V2.5h5V5m-9 8.5h2m9 0h2','pulse',p(car+'M10 5V3h4v2')+wheels),
  i('truck',p('M2.5 17V5H14v12m0-9h4l3.5 4.5V17h-2m-4 0H9m-4 0H2.5')+wheels,'M14 12.5h7.5','pulse',p('M3 17V6h11v11zm11 0V9h4l3 4v4z')+c(7,18,1.5)+c(17,18,1.5)),
  i('van',p('M3 17V7h11l6.5 6v4H19m-4 0H9m-4 0H3z')+wheels,'M13 8v5h7.5','pulse',p('M3 17V7h11l7 6v4H3z')+c(7,17.5,1.5)+c(17,17.5,1.5)),
  i('bus',r(4,3,16,15,2)+p('M6.5 18v2m11 0v-2M4 12h16'),'M7.5 15h1m7 0h1','pulse','M4 4h16v14H4zm0 8h16M7 18v2m10 0v-2'),
  i('train',cabin,'M8.5 14.5h.01m7 0h.01M9 6.5h6','pulse','M5 4h14v14H5zm0 7h14M7 21l3-3m7 3-3-3'),
  i('tram',cabin+'<path d="m9 3 3-2 3 2"/>','M9 14.5h.01m6 0h.01','pulse','M5 4h14v14H5zm0 7h14m-10-7 3-2 3 2M7 21l3-3m7 3-3-3'),
  i('subway',r(6,6,12,12,2)+p('M3 21v-9a9 9 0 0 1 18 0v9m-13-1 2-2m6 2-2-2'),'M6 12h12m-9 3h.01m6 0h.01','pulse','M3 21v-9a9 9 0 0 1 18 0v9M6 7h12v11H6zm0 5h12'),
  i('motorcycle',c(6,17,3)+c(18,17,3)+p('M6 17l3-5h5l4 5m-7-5 3-5h3m0 0 1 10'),'M7 10h4','nudge',c(6,17,3)+c(18,17,3)+p('M6 17l3-5h5l4 5-2-10h3')),
  i('scooter',c(6,18,2.5)+c(18,18,2.5)+p('M8.5 18h6l3.5-2.5L15.5 5H12'),'M15.5 5h3','nudge',c(6,18,2.5)+c(18,18,2.5)+p('M8.5 18h9.5L15 5h4')),
  i('skateboard',c(7.5,17.5,1.8)+c(16.5,17.5,1.8),'M3 10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4','nudge',p('M3 11l3 3h12l3-3')+c(7.5,17.5,1.5)+c(16.5,17.5,1.5)),
  i('airplane',turn(32,plane),'','glide',turn(32,miniPlane)),
  i('plane-takeoff','M4 21h16',turn(27,'M12 3v13m-8-3 8-5 8 5m-11 4 3-2 3 2'),'rise','M4 21h16m-11-3 9-13m-12 6 7 1 7 4'),
  i('plane-landing','M4 21h16',turn(130,'M12 4v15m-8-5 8-5 8 5m-11 5 3-2 3 2'),'drop','M4 21h16m-2-4L6 6m2 9 4-4 7-1'),
  i('helicopter','M3 13h5l4-4h5a4 4 0 0 1 0 8H8l-3-2H3zm7 4v3m7-3v3M8 20h11M14 9V5','M7 5h14','rotor','M3 13h5l4-4h5a4 4 0 0 1 0 8H8zm11-4V5M8 5h12m-9 12v3m6-3v3'),
  i('hot-air-balloon','M9 16c-1.5-3-4-4.7-4-7a7 7 0 0 1 14 0c0 2.3-2.5 4-4 7m-6 0h6l-1 5h-4z','M12 3c-2.5 3.5-2.5 8 0 13 2.5-5 2.5-9.5 0-13','bob','M9 16C.5 6 9 .5 12 3c3-2.5 11.5 3 3 13zm0 0h6l-1 5h-4z'),
  i('sailboat','M12 3v13m0-12 6 10h-6m-2-8-5 8h5M3 17h18l-3 4H6z','M5 18.5h14','breeze','M12 4v12m0-11 6 9h-6m-3-6-4 6h4m-6 3h18l-3 4H6z'),
  i('ship','M3 15l9-3 9 3-3 5H6zm4-2V7h10v6m-7-6V4h4v3','M4 22q2-1 4 0t4 0t4 0t4 0','wave','M3 15l9-3 9 3-3 5H6zm4-2V7h10v6'),
  i('canoe','M2.5 14q8.5 3 19 0l-3 5h-13z','m9 14 7-9m0 0 1.5-1.5 2 1.5L18 7z','nudge','M3 14l9 2 9-2-3 5H6zm7 0 7-9'),
  i('anchor',c(12,5,2)+p('M12 7v13m-4-8h8'),'M4 13v2a8 5 0 0 0 16 0v-2m-16 0-2 3m2-3 3 2m13-2 2 3m-2-3-3 2','nudge',c(12,5,2)+p('M12 7v13m-7-6a7 6 0 0 0 14 0m-2 2 2-2 2 2m-18 0 2-2 2 2')),
  i('life-buoy',c(12,12,9)+c(12,12,4.5),'m5.5 5.5 3.3 3.3m6.4 6.4 3.3 3.3m0-13-3.3 3.3m-6.4 6.4-3.3 3.3','spin',c(12,12,8)+c(12,12,4)+p('m6.5 6.5 2.7 2.7m5.6 5.6 2.7 2.7m0-11-2.7 2.7m-5.6 5.6-2.7 2.7')),
  i('luggage',r(5,6,14,14,2)+p('M9 6V3h6v3M7 20v1m10-1v1'),'M9 9v8m6-8v8','pulse','M5 6h14v14H5zm4 0V3h6v3M7 20v1m10-1v1'),
  i('backpack',r(5,5,14,16,4)+p('M9 5V3h6v2'),r(8,12,8,5,1),'pulse','M5 9q0-4 4-4h6q4 0 4 4v12H5zm4-4V3h6v2m-6 9h6'),
  i('passport',r(5,3,14,18,2)+p('M8 3v18'),c(13.5,11,3.5)+p('M10 11h7m-3.5-3.5q3 3.5 0 7-3-3.5 0-7'),'pulse','M5 3h14v18H5zM8 3v18'+ 'M10 11a3 3 0 1 0 6 0 3 3 0 1 0-6 0'),
  i('ticket','M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z','M15 8v1m0 2.5v1m0 2.5v1','pulse','M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM15 8v8'),
  i('map-folded','M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zm6-3v15m6-12v15','m6 13 3-2 5 3 4-2','trace','M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zm6-3v15m6-12v15'),
  i('route',c(5,17,2)+c(19,7,2),'M7 17h9a3 3 0 0 0 0-6H8a2 2 0 0 1 0-4h9','trace',c(5,17,1.5)+c(19,7,1.5)+p('M7 17h9a3 3 0 0 0 0-6H9a2 2 0 0 1 0-4h8')),
  i('signpost','M12 3v18','M4 5h13l4 3-4 3H4zm16 8H7l-3 3 3 3h13z','nudge','M12 3v18M4 6h13l3 2-3 2H4zm16 8H7l-3 2 3 2h13z'),
  i('parking',r(4,3,16,18,3),'M10 16V8h4a2.5 2.5 0 0 1 0 5h-4','trace','M4 4h16v16H4zm6 12V8h4a2 2 0 0 1 0 4h-4'),
  i('traffic-light',r(7,2.5,10,19,3)+p('M7 7H4m3 5H4m3 5H4m13-10h3m-3 5h3m-3 5h3'),c(12,7,1.3)+c(12,12,1.3)+c(12,17,1.3),'signal',r(7,3,10,18,2)+c(12,7.5,1)+c(12,12,1)+c(12,16.5,1)),
];
