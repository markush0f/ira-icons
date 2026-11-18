// Generado desde icons/. No editar a mano.
const icons = {
  "arrow-left": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"M20 12H4m7-7-7 7 7 7\" />"
  },
  "arrow-right": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"M4 12h16m-7-7 7 7-7 7\" />"
  },
  "check": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"m4 12 5 5L20 6\" />"
  },
  "chevron-down": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"m5 9 7 7 7-7\" />"
  },
  "close": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"m6 6 12 12M18 6 6 18\" />"
  },
  "home": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9\" />"
  },
  "menu": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"M4 6h16M4 12h16M4 18h16\" />"
  },
  "minus": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"M4 12h16\" />"
  },
  "plus": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<path d=\"M12 4v16M4 12h16\" />"
  },
  "search": {
    "attributes": {
      "xmlns": "http://www.w3.org/2000/svg",
      "viewBox": "0 0 24 24",
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    },
    "shapes": "<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\" />\n  <path d=\"m16 16 4 4\" />"
  }
};

export const iconNames = Object.freeze(Object.keys(icons));

export function getIcon(name) {
  return typeof name === 'string' && Object.hasOwn(icons, name) ? icons[name] : undefined;
}
