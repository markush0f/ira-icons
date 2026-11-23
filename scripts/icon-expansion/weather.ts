import { icon as i, p, c, g } from './geometry.ts';

const cloud = 'M6 14a4 4 0 0 1-.8-7.9 5 5 0 0 1 9.5-1.6A4.8 4.8 0 1 1 17 14z';
const plainCloud = 'M6 14a4 4 0 0 1 0-8 5 5 0 0 1 9-1 4.5 4.5 0 1 1 2 9z';
const weather = (name: string, mark: string, motion: string) => i(`cloud-${name}`,cloud,mark,motion,p(plainCloud)+(mark.startsWith('<')?mark:p(mark)));
const snow = 'M12 3v18M4.2 7.5l15.6 9m0-9-15.6 9';
const drop = 'M12 3q6 7 6 11a6 6 0 1 1-12 0q0-4 6-11z';
const horizon = 'M3 17h18m-15 4h12M7 17a5 5 0 0 1 10 0';
const thermal = 'M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z';

export const weatherIcons = [
  weather('rain','m7 17-1 3m6-3-1 3m6-3-1 3','drop'),
  weather('drizzle','m8 16-.5 1.5m5.5 1-.5 1.5m5-4-.5 1.5','drop'),
  weather('snow','M7 17v4m-2-2h4m8-2v4m-2-2h4','drop'),
  weather('lightning','m13 14-4 5h4l-2 3','spark'),
  weather('hail',c(8,18,1.3)+c(15.5,19.5,1.3),'drop'),
  weather('fog','M5 17h14M8 20h8','breeze'),
  weather('wind','M4 18h12q4 0 4-2m-11 5h7','breeze'),
  i('cloud-sun','M5 18a4 4 0 0 1 0-8 5 5 0 0 1 9 0 4 4 0 0 1 1 8z','M14 4a4 4 0 1 1 4 6m0-8v1m4 1-1 1m1 6 1 1','spark','M5 18a4 4 0 1 1 0-8 5 5 0 0 1 9 0 4 4 0 0 1 1 8zM15 4a4 4 0 0 1 4 6'),
  i('cloud-moon','M5 19a3.5 3.5 0 0 1 0-7 4.5 4.5 0 0 1 8.5 0 3.5 3.5 0 1 1 1 7z','M19 3a4.5 4.5 0 0 0 3 7 4.6 4.6 0 1 1-3-7z','pulse','M5 19a3.5 3.5 0 0 1 0-7 4 4 0 0 1 8 0 3.5 3.5 0 1 1 1 7zm13-16a4 4 0 0 0 4 6 4 4 0 1 1-4-6z'),
  i('cloud-rain-sun','M5 14a3 3 0 0 1 0-6 4.5 4.5 0 0 1 8.5 0 3 3 0 1 1 1 6zM14 3a4 4 0 0 1 5 6','m7 17-1 3m6-3-1 3m6-3-1 3','drop','M5 14a3 3 0 1 1 0-6 4 4 0 0 1 8 0 3 3 0 1 1 1 6zM14 3a4 4 0 0 1 5 6m-9 8-1 3m6-3-1 3'),
  i('thermometer',thermal,'M12 16V9m0 8h.01','heat','M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0zm2 1v3'),
  i('thermometer-hot',thermal,'M12 16V7m5 3h3m-3-4h2','heat','M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0zm2 1V8m5 0h3'),
  i('thermometer-cold',thermal,'M12 16v-3m7-9v6m-2-5 4 4m0-4-4 4','pulse','M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0zm2 1v3m7-14v6m-2-3h4'),
  i('wind','M3 8h13a2 2 0 1 0-2-2M2 12h17a2 2 0 1 1-2 2M5 16h6a2 2 0 1 1-2 2','','breeze','M3 8h13a2 2 0 0 0 0-4m-14 8h16a2 2 0 0 1 0 4M5 16h6'),
  i('tornado','M3 4q9-2 18 0-9 2-18 0zm2 4 14 1m-12 3 10 1m-8 3 6 1','M11 20h2','wind-tip','M3 4h18l-2 4H5zm4 8h10m-8 4h6m-4 4h2'),
  i('rainbow','M3 18a9 9 0 0 1 18 0M6 18a6 6 0 0 1 12 0','M9 18a3 3 0 0 1 6 0','pulse','M3 18a9 9 0 0 1 18 0M7 18a5 5 0 0 1 10 0'),
  i('sunrise',horizon,'M12 10V3m-3 3 3-3 3 3M4 11l1.5 1.5M20 11l-1.5 1.5','rise','M3 17h18M7 17a5 5 0 0 1 10 0m-5-7V4m-3 3 3-3 3 3'),
  i('sunset',horizon,'M12 3v7m-3-3 3 3 3-3M4 11l1.5 1.5M20 11l-1.5 1.5','drop','M3 17h18M7 17a5 5 0 0 1 10 0m-5-13v6m-3-3 3 3 3-3'),
  i('snowflake',snow,'m9 4 3 3 3-3m-6 16 3-3 3 3M4 11l4-.5V6m12 7-4 .5V18m4-7-4-.5V6M4 13l4 .5V18','spark',snow),
  i('droplet',drop,'M9 15q.5 2 2.5 2.5','pulse','M12 4q5.5 7 5.5 10a5.5 5.5 0 1 1-11 0q0-3 5.5-10z'),
  i('droplets','M8 3q4.5 5.3 4.5 9a4.5 4.5 0 0 1-9 0q0-3.7 4.5-9z','M17 9q4 4.6 4 8a4 4 0 0 1-8 0q0-3.4 4-8z','drop','M8 4q4 5 4 8a4 4 0 0 1-8 0q0-3 4-8zm9 6q4 5 4 7a4 4 0 0 1-8 0q0-2 4-7z'),
  i('waves','M3 7q3-3 6 0t6 0t6 0m-18 9q3-3 6 0t6 0t6 0','M3 11.5q3-3 6 0t6 0t6 0','breeze','M3 8q3-3 6 0t6 0t6 0M3 16q3-3 6 0t6 0t6 0'),
  i('water-level','M5 4v16h14V4m-3 3h3m-3 4h3','M6 14q3-2 6 0t6 0','breeze','M5 4v16h14V4M5 13h14'),
  i('humidity',drop,c(10,12,0.7)+c(14,16,0.7)+p('m10 16 4-4'),'pulse','M12 4q5 7 5 10a5 5 0 1 1-10 0q0-3 5-10zm-2 12 4-4'),
  i('icicle','M3 4h18l-3 8-2-3-3 11-3-10-2 4z','M15 19h.01','drop','M3 5h18l-3 7-2-3-3 12-3-11-2 4z'),
  i('flood','m4 10 8-7 8 7m-14-1v5m12-5v5','M3 16q3-2 6 0t6 0t6 0M3 20q3-2 6 0t6 0t6 0','breeze','m4 10 8-7 8 7m-14 0v4m12-4v4M3 17q3-2 6 0t6 0t6 0'),
  i('hurricane','M19 5c-4 0-12 2-12 8a5 5 0 0 0 10 0c0-5-8-3-8 1s3 5 8 6','M5 7q4-3 8-4M5 17q2 4 7 5','spin','M19 5Q7 6 7 13a5 5 0 1 0 10 0c0-5-8-3-8 1q0 5 8 6'),
  i('ultraviolet',c(12,12,6.5),'M12 2v2m0 16v2M2 12h2m16 0h2m-13-2v3q1 2 2 0v-3m2 0 1 4 1-4','spark',c(12,12,7)+p('M8 10v3q1 2 2 0v-3m3 0 1 4 1-4')),
  i('weather-vane','M12 4v16m-6 1h12','M4 8h16l-4-4v8l4-4M4 8l3-2v4z','nudge','M12 4v16m-6 1h12M4 8h16l-3-3m3 3-3 3'),
  i('moon-stars','M15 16.5a6.5 6.5 0 0 1-7.5-8.5 6.8 6.8 0 1 0 7.5 8.5z','M16 4v6m-3-3h6m1 5v4m-2-2h4','spark','M15 16.5a6.5 6.5 0 0 1-7.5-8.5 6.8 6.8 0 1 0 7.5 8.5zM17 4v6m-3-3h6'),
];
