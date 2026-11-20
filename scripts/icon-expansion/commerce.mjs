import { icon as i, p, r, c } from './geometry.mjs';

const bill = r(2.5,5.5,19,13,2);
const coin = c(12,12,9);
const bag = 'M5 8h14l2 13H3zm4 0V6a3 3 0 0 1 6 0v2';
const priceTag = 'M3 4h8l10 10-7 7L3 10z';
const cart = 'M2.5 4H5l2 11h12l2-8H6';
const markCheck = 'm10 11 2 2 4-4';

export const commerceIcons = [
  i('wallet',r(3,5,18,14,2)+p('M3 9V6l11-3'),'M21 10h-6a2 2 0 0 0 0 4h6m-5-2h.01','pulse','M3 5h18v14H3zm18 5h-6a2 2 0 0 0 0 4h6'),
  i('coins',c(9,9,5)+p('M4 9v3a5 5 0 0 0 5 5m4-8a5 4 0 1 1 0 8'),'M11 16v2a5 3 0 0 0 10 0v-4','drop','M4 9a5 4 0 1 0 10 0 5 4 0 1 0-10 0zm5 5a6 4 0 1 0 12 0 6 4 0 1 0-12 0'),
  i('banknote',bill,c(12,12,2.5)+p('M6 9h.01m12 6h.01'),'pulse',r(3,6,18,12)+c(12,12,2.5)),
  i('banknotes',p('M20 4H6M3 7h18v13H3z'),c(12,13.5,2.5)+p('M6 10h.01m12 7h.01'),'pulse',r(3,7,18,13)+c(12,13.5,2.5)+p('M6 4h14')),
  i('dollar',coin,'M15 8.5h-5a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9m3-10v12','pulse',c(12,12,8)+p('M15 9h-5a1.5 1.5 0 0 0 0 3h4a1.5 1.5 0 0 1 0 3H9m3-7v8')),
  i('euro',coin,'M16 8a4.5 4.5 0 0 0-7 4v1a4.5 4.5 0 0 0 7 3M7.5 11H14m-6.5 3H13','pulse',c(12,12,8)+p('M16 8a4 4 0 1 0 0 8m-8-4h6')),
  i('pound',coin,'M15.5 9a2.5 2.5 0 0 0-5 0v4q0 2-1.5 3h7m-8-4h6','pulse',c(12,12,8)+p('M15 9q-2-3-4-1v5l-2 3h7m-8-4h6')),
  i('yen',coin,'m8.5 7.5 3.5 5 3.5-5M12 12.5V18m-3.5-5h7m-7 3h7','pulse',c(12,12,8)+p('m9 8 3 5 3-5m-3 5v4m-3-4h6m-6 3h6')),
  i('receipt','M5 3l2.5 2L10 3l2 2 2-2 2.5 2L19 3v18l-2.5-2-2.5 2-2-2-2 2-2.5-2L5 21z','M8.5 9h7m-7 3h7m-7 3h4','trace','M5 4l3 2 4-2 4 2 3-2v16l-3-2-4 2-4-2-3 2zm4 5h6m-6 4h6'),
  i('invoice','M5 3h10l4 4v14H5zm10 0v4h4','M8 9h5m-5 4h8m-8 4h8m-2-4v4','trace','M5 3h10l4 4v14H5zm3 8h8m-8 4h8m-2-4v4'),
  i('percent',c(7,7,2.5)+c(17,17,2.5),'M5 19 19 5','trace',c(7,7,2)+c(17,17,2)+p('M5 19 19 5')),
  i('discount','M12 3l2.5 2.5H18V9l3 3-3 3v3h-3.5L12 21l-2.5-3H6v-3l-3-3 3-3V5.5h3.5z','M9 15l6-6M9 9h.01m6 6h.01','spark','M12 3l3 3h3v3l3 3-3 3v3h-3l-3 3-3-3H6v-3l-3-3 3-3V6h3zm-3 12 6-6'),
  i('coupon','M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z','m9 15 6-6M9 9h.01m6 6h.01','spark','M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4zm6 9 6-6'),
  i('barcode-scan','M8 3H3v5m13-5h5v5m0 8v5h-5m-8 0H3v-5M7 7v10m3-10v10m4-10v10m3-10v10','M3 12h18','sweep','M8 3H3v5m13-5h5v5m0 8v5h-5m-8 0H3v-5m4-9v10m5-10v10m5-10v10'),
  i('shopping-bag',bag,'M9 12q3 4 6 0','bob','M5 8h14l2 13H3zm4 0V6a3 3 0 0 1 6 0v2M9 12h.01m6 0h.01'),
  i('shopping-basket','M3 10h18l-2 10H5zm4 0 4-6m6 6-4-6','M9 13l1 4m4 0 1-4','pulse','M3 10h18l-2 10H5zm4 0 5-6 5 6'),
  ...[['plus','M13.5 9v4m-2-2h4'],['minus','M11.5 11h4'],['check',markCheck],['remove','m11.5 9 4 4m0-4-4 4']]
    .map(([action, d]) => i(`cart-${action}`,p(cart)+c(9,19.5,1.5)+c(17,19.5,1.5),d,'trace',p('M3 5h2l2 10h12l2-8H6'+d)+c(9,19,1)+c(17,19,1))),
  i('storefront','M4 10v10h16V10M3 8l2-5h14l2 5v2q-2 3-4.5 0-2.5 3-4.5 0-2 3-4.5 0Q5 13 3 10z','M8 20v-5h4v5m3-5h2','pulse','M4 10v10h16V10M3 8l2-4h14l2 4v2H3zm5 12v-5h4v5'),
  i('bank','m3 8 9-5 9 5zm1 12h16m-2-10v7m-4-7v7m-4-7v7m-4-7v7','M12 6h.01','pulse','M3 8l9-5 9 5zm3 2v7m6-7v7m6-7v7M3 20h18'),
  i('piggy-bank','M4 13a6.5 6.5 0 0 1 10-5.5l4-2v4l3 2v5h-3l-1 3h-3l-.5-2H9l-.5 2h-3l-.5-4M4 13q-3 0-2-2','M9 8.5h4m4 4h.01','pulse','M4 13a6.5 6.5 0 0 1 10-5.5l4-2v4l3 2v5h-3l-1 3h-3v-2H9v2H6l-2-4z'),
  i('safe',r(3,4,18,16,2)+p('M6 20v1m12-1v1M6 8v8'),c(14,12,3)+p('M14 9v6m-3-3h6'),'spin',p('M3 4h18v16H3zM6 8v8')+c(14,12,2.5)),
  i('cash-register','M5 10h14l2 5v5H3v-5zm2 0V4h10v6M3 16h18','M8 13h.01m4 0h.01m4 0h.01m-6 5h4','pulse','M5 10h14l2 5v5H3v-5zm2 0V4h10v6M3 16h18'),
  i('package-open','m3 9 9-5 9 5-9 5zm0 0v9l9 4 9-4V9m-9 5v8','m3 9-1-4 8-3 2 2m9 5 1-4-8-3-2 2','clap','M3 9l9-5 9 5v9l-9 4-9-4zm0 0 9 5 9-5m-9 5v8'),
  i('package-check','M3 7l9-4 9 4v11l-9 4-9-4zm0 0 9 4 9-4','m8.5 15 2.5 2.5 4.5-4.5','trace','M3 7l9-4 9 4v11l-9 4-9-4zm0 0 9 4 9-4m-12 8 2 2 4-4'),
  i('price-tag',p(priceTag)+c(7,8,1),'M13 11l3 3','pulse',p(priceTag)+c(7,8,1)),
  i('price-tags','M3 4h8l10 10-7 7L3 10z','M13 4l8 8M7 8h.01','pulse','M3 4h8l10 10-7 7L3 10zm10 0 8 8'),
  i('card-contactless',r(3,5,18,14,2)+p('M6 14h3'),'M13 10q2 2 0 4m2-6q4 4 0 8','pulse','M3 5h18v14H3zm3 9h3m5-4q2 2 0 4m2-5q3 3 0 6'),
];
