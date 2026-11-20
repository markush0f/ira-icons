import { icon as i, p, c, r, g } from './geometry.mjs';

const bottle = 'M10 3h4v5l3 3v8q0 2-2 2H9q-2 0-2-2v-8l3-3z';
const glass = 'M6 4h12l-1.5 16h-9z';
const steam = 'M8 8q-1-1 0-2t0-2m4 4q-1-1 0-2t0-2m4 4q-1-1 0-2t0-2';
const bowls = 'M3 12h18a9 8 0 0 1-18 0z';
const door = 'M5 21h14M7 21V4h10v17';
const chair = 'M6 12V5h8v8m-8-1h12v5H6zm1 5v4m10-4v4';

export const homeFoodIcons = [
  i('utensils','M5 3v6a3 3 0 0 0 6 0V3m-3 0v18M16 3q-3 3-3 9h4v9','M17 3v9','pulse','M5 4v4a3 3 0 0 0 6 0V4M8 4v17m9 0V3q-4 2-4 9h4'),
  i('spoon','M11 13q-1.2 0-2-1-3-4 .5-7.5a3.5 3.5 0 0 1 5 0Q18 8 15 12q-.8 1-2 1','M12 13v8','bob','M12 13v8m0-8c-5 0-5-9 0-9s5 9 0 9z'),
  i('cup','M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z','M16 10h2a2.5 2.5 0 0 1 0 5h-2','pulse','M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zm12 1h2a2.5 2.5 0 0 1 0 5h-2'),
  i('teapot','M7 10h10v4a5 5 0 0 1-10 0zM7 12 3 8v5l4 3m10-5h2a2 2 0 0 1 0 4h-2M7 10q5-5 10 0','M12 6v1','bob','M7 10h10v4a5 5 0 0 1-10 0zm0 2-4-4v5l4 3m10-5h2a2 2 0 0 1 0 4h-2M8 8h8'),
  i('glass-water',glass,'M7 10q2.5-1.5 5 0t5 0','wave','M6 4h12l-1.5 16h-9zM7 10h10'),
  i('water-bottle',bottle,'M7 13h10m-10 4h10','wave','M10 3h4v5l3 3v10H7V11l3-3zm-3 12h10'),
  i('wine-glass','M7 4h10l-1 7a4 4 0 0 1-8 0zm5 11v6m-4 0h8','M8 9q2-1 4 0t4 0','wave','M7 4h10l-1 7a4 4 0 0 1-8 0zm1 5h8m-4 6v6m-4 0h8'),
  i('bowl',bowls,steam,'steam','M3 12h18a9 8 0 0 1-18 0zm6-5V4m6 3V4'),
  i('cooking-pot','M5 9h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zm0 2H2m17 0h3','M4 8h16m-11 0V5h6v3','bob','M5 9h14v11H5zm0 2H2m17 0h3M4 7h16m-11 0V5h6v2'),
  i('kettle','M8 9h8l2 11H6zm0 0 1-3h6l1 3m-7-3V4h6v2m3 7h2v4h-2','M7 13H4l-2-3m2 3v3h3','sway','M8 9h8l2 11H6zm0 0 1-3h6l1 3m2 4h2v4h-2m-13-1H4l-2-5'),
  i('pizza','M3 6q9-5 18 0l-9 15zM5 9q7-4 14 0',c(9.5,11,0.8)+c(14.5,11,0.8)+c(12,15,0.8),'pulse','M3 6q9-5 18 0l-9 15zm3 3q6-3 12 0M12 13h.01'),
  i('burger','M4 10a8 6 0 0 1 16 0zm0 7h16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z','M3 13q2.2 2 4.5 0t4.5 0t4.5 0t4.5 0','bob','M4 10a8 6 0 0 1 16 0zm0 7h16v3H4zm-1-3h18'),
  i('sandwich','M3 14l7-8 11 8v5H3z','M3 14h18m-16 2 3 1 4-1 4 1 3-1','bob','M3 14l7-8 11 8v5H3zm0 2h18'),
  i('bread','M5 20V10c-2-1-2-4 0-5q7-4 14 0c2 1 2 4 0 5v10z','M8 15q4-2 8 0','pulse','M5 20V10c-2-1-2-4 0-5q7-4 14 0c2 1 2 4 0 5v10z'),
  i('croissant','M3 16q3-10 9-10t9 10l-4 2-2-5H9l-2 5z','M7 8l2 5m8-5-2 5m-3-7v7','pulse','M3 16q3-10 9-10t9 10l-4 2-2-5H9l-2 5zm6-8v5m6-5v5'),
  i('egg','M12 3c3 0 7 7 7 11a7 7 0 1 1-14 0c0-4 4-11 7-11z','M9 15q0 2 2 2','pulse','M12 3c3 0 6 7 6 11a6 6 0 1 1-12 0c0-4 3-11 6-11z'),
  i('apple','M12 9c-4-4-9-1-8 4 1 4 4 8 6 7l2-1 2 1c3 1 6-4 6-8 0-5-5-6-8-3z','M12 9V7q0-4 4-4 0 4-4 4','sway','M12 9c-5-4-9-1-8 4s4 8 7 6h2c3 2 6-2 7-6s-4-8-8-4zm0 0V5'),
  i('carrot','M9 7q2.5-2.5 5 0l3 3q2 2 0 4L4 21zm-1 5 2 2m1-5 2 2','M14 7l3-4m0 7 4-3m-4 0 3-4','sway','M9 7q3-2 5 0l3 3q2 2 0 4L4 21zm5 0 3-4m0 7 4-3'),
  i('ice-cream','m7 13 5 8 5-8z','M7 13a5 5 0 0 1 10 0','bob','m7 13 5 8 5-8zm0 0a5 5 0 0 1 10 0'),
  i('cake','M4 13h16v7H4zm0 3q2 2 4 0t4 0t4 0t4 0M12 13v-3','M12 8c-2-.5-2-2 0-4 2 2 2 3.5 0 4z','flame','M4 13h16v7H4zm8 0v-3m0-2c-2-.5-2-2 0-4 2 2 2 3.5 0 4z'),
  i('candy','M8 10l4-4 6 6-4 4z','M8 10H4l-1 4 5-1m10-1h3l-1-5-4 1','pulse','M8 10l4-4 6 6-4 4zm0 0H4l-1 4 5-1m10-1h3l-1-5-4 1'),
  i('door-open','M5 21h15M7 21V4h10v17','M7 4l7-2v17l-7 2m4-9h.01','door','M5 21h15M7 21V4l7-2v17l-7 2M17 4v17'),
  i('door-closed',door,'M14 12h.01','pulse','M7 21V4h10v17zm7-9h.01'),
  i('window',r(4,4,16,16,1)+p('M12 4v16M4 12h16'),'M6 9l3-3m6 10 3-3','pulse','M4 4h16v16H4zm8 0v16m-8-8h16'),
  i('chair',chair,'M8 7h4','pulse','M6 12V5h8v8m-8 0h12v4H6zm1 4v4m10-4v4'),
  i('sofa','M4 11V8q0-2 2-2h12q2 0 2 2v3m-16 6v3m16-3v3','M3 16v-3a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v3q0 1-1 1H4q-1 0-1-1z','pulse','M4 11V6h16v5M3 11h4v3h10v-3h4v6H3zm1 6v3m16-3v3'),
  i('bed','M3 20V5m0 12h18v3m0-3v-5q0-2-2-2H9v7','M5 12h4M3 14h6','pulse','M3 20V6m0 11h18v3m0-3v-6H9v6m-6-4h6'),
  i('lamp','M12 11v9m-4 0h8','M7 4h10l3 7H4zm5 10v1','spark','M7 4h10l3 7H4zm5 7v9m-4 0h8'),
  i('fan',c(12,12,9),'M12 12q-3-4-1-6 3-1 3 4 5-1 6 2-1 3-5 2 0 4-3 4-3-1-1-5-4 2-5-1 1-3 6 0z','spin',c(12,12,8)+p('M12 12q-3-4-1-6 3-1 3 4 5-1 6 2-1 3-5 2 0 4-3 4-3-1-1-5-4 2-5-1 1-3 6 0z')),
  i('faucet','M3 9h6V6h6v3h2a4 4 0 0 1 4 4v2h-5v-2H3zM10 3h4m-2 0v3','M18.5 17v2','drop','M3 9h6V6h6v3h3a3 3 0 0 1 3 3v3h-5v-2H3zm9-6v3m6.5 11v2'),
];
