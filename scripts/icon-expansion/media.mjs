import { icon as i, p, c, r, g } from './geometry.mjs';

const note = 'M10 17V6l9-2v11m-9 2c0 2-4 3-4 1s4-3 4-1m9-2c0 2-4 3-4 1s4-3 4-1';
const screen = r(3,5,18,14,2);
const triangle = 'm10 8 6 4-6 4z';
const step = 'm5 6 9 6-9 6zM18 6v12';
const bar = 'M4 12v2m4-6v10m4-14v17m4-12v7m4-5v3';
const film = r(3,4,18,16,2);
const filmHoles = 'M3 9h4m-4 6h4m10-6h4m-4 6h4M7 4v16m10-16v16';

export const mediaIcons = [
  i('headphones','M4 14v-2a8 8 0 0 1 16 0v2',r(4,12,4,7,2)+r(16,12,4,7,2),'beat','M4 16v-4a8 8 0 0 1 16 0v4m-16-3h4v6H4zm16 0h-4v6h4z'),
  i('speaker',r(6,3,12,18,2)+c(12,7,1),c(12,15,3.5),'beat',p('M6 3h12v18H6zM12 7h.01')+c(12,15,3)),
  i('megaphone','M4 9h6l7-4v14l-7-4H4zm3 6 1 5h3l-1-5','M20 9l1.5-1m-1.5 4h2m-2 3 1.5 1','pulse','M4 9h6l7-4v14l-7-4H4zm3 6 1 4m12-7h2'),
  i('music-note','M10 17V5l7-2v4l-7 2','M10 17c0 2.5-5 3.5-5 1s5-3.5 5-1z','beat','M10 17V5l7-2m-7 14c0 2-4 3-4 1s4-3 4-1'),
  i('music-notes',note,'M10 10l9-2','beat',note),
  i('vinyl',c(12,12,9)+c(12,12,2),'M6 11q1-5 6-5m0 12q5-1 6-5','spin',c(12,12,8)+c(12,12,2)+p('M7 11q1-4 5-4')),
  i('cassette',r(3,5,18,14,2)+p('m6 19 2-4h8l2 4'),c(8,10.5,2)+c(16,10.5,2)+p('M10 10.5h4'),'pulse','M3 5h18v14H3zm3 14 2-4h8l2 4M8 10h.01m8 0h.01m-6 0h4'),
  i('radio',r(3,8,18,12,2)+p('M5 8l13-5M6 16h3m-3-4h3'),c(15,14,2.5),'pulse','M3 8h18v12H3zm2 0 13-5m-12 9h3m-3 4h3'+ 'M15 12a2 2 0 1 0 0 4 2 2 0 1 0 0-4'),
  i('podcast',c(12,9,2)+p('m10 14 1 7h2l1-7a2.1 2.1 0 0 0-4 0z'),'M7 13a6 6 0 1 1 10 0M4.5 15.5a9 9 0 1 1 15 0','pulse','M7 13a6 6 0 1 1 10 0M12 9h.01m-2 5 1 7h2l1-7z'),
  i('audio-lines',bar,'','bars','M4 12v2m4-5v8m4-12v15m4-10v6m4-4v2'),
  i('volume-low','m11 5-5 4H3v6h3l5 4z','M15 9q3 3 0 6','pulse','m11 6-5 4H3v4h3l5 4zm4 4q2 2 0 4'),
  i('volume-mute','m11 5-5 4H3v6h3l5 4z','m15 9 6 6m0-6-6 6','trace','m11 6-5 4H3v4h3l5 4zm5 4 4 4m0-4-4 4'),
  i('microphone-off',r(9,3,6,11,3)+p('M6 12a6 6 0 0 0 12 0m-6 6v3m-3 0h6'),'M3 3l18 18','trace','M9 6a3 3 0 0 1 6 0v3M6 12a6 6 0 0 0 10 4m-4 2v3m-3 0h6M3 3l18 18'),
  i('play-circle',c(12,12,9),triangle,'pulse',c(12,12,8)+p('m10 8 5.5 4-5.5 4z')),
  i('pause-circle',c(12,12,9),'M10 8v8m4-8v8','pulse',c(12,12,8)+p('M10 9v6m4-6v6')),
  i('stop-circle',c(12,12,9),r(8.5,8.5,7,7,1),'pulse',c(12,12,8)+r(9,9,6,6)),
  i('record',c(12,12,9),c(12,12,3.5),'pulse',c(12,12,8)+c(12,12,2.5)),
  i('skip-forward',step,'','nudge','m5 7 8 5-8 5zM18 7v10'),
  i('skip-back',g('rotate(180 12 12)',step),'','nudge',g('rotate(180 12 12)','m5 7 8 5-8 5zM18 7v10')),
  i('fast-forward','m3 6 8 6-8 6z','m12 6 8 6-8 6z','nudge','m4 7 7 5-7 5zm8 0 7 5-7 5z'),
  i('rewind','m21 6-8 6 8 6z','m12 6-8 6 8 6z','breeze','m20 7-7 5 7 5zm-8 0-7 5 7 5z'),
  i('repeat','M4 10V8q0-3 3-3h12m1 9v2q0 3-3 3H5','m16 2 3 3-3 3M8 16l-3 3 3 3','pulse','M4 9V5h15m-3-3 3 3-3 3m4 7v4H5m3-3-3 3 3 3'),
  i('shuffle','M3 6h3q2 0 4 3l4 6q2 3 4 3h3M3 18h3q2 0 4-3','M14 8q2-2 4-2h3m-3-3 3 3-3 3m0 6 3 3-3 3','pulse','M3 6h4l10 12h4m-3-3 3 3-3 3M3 18h4l3-4m4-4 3-4h4m-3-3 3 3-3 3'),
  i('film',film,filmHoles,'pulse',p('M3 4h18v16H3zm4 0v16m10-16v16m-14-8h4m10 0h4')),
  i('clapperboard',r(4,10,16,10,1),'m4 10-1-4 16-3 1 4zm4-1L6 5.5m8 2.3-2-3','clap','M4 10h16v10H4zm0 0-1-4 16-3 1 4z'),
  i('subtitles',screen,'M6 10h5m3 0h4M6 14h3m3 0h6','trace','M3 5h18v14H3zm3 6h5m3 0h4m-12 3h12'),
  i('picture-in-picture',screen,r(12,10,7,6,1),'pulse','M3 5h18v14H3zm9 5h6v6h-6z'),
  i('television',r(3,7,18,13,2)+p('m8 3 4 4 4-4'),'M7 11h10v5H7z','pulse','M3 7h18v13H3zm5-4 4 4 4-4'),
  i('camera-off',p('M3 8h4l2-3h6l2 3h4v11H3z')+c(12,13.5,3),'M3 3l18 18','trace','M3 8h4l2-3h6l2 3h4v11H3zM3 3l18 18'),
  i('flash',p('M4 9h5l2-3h4l2 3h3v11H4z')+c(12,14,3),'m19 2-1 2m4 0-1.5 1m1.5 2h-1','spark','M4 9h5l2-3h4l2 3h3v11H4zm15-7-1 2m4 1-1 1'),
];
