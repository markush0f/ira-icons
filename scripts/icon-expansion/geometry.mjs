export const p = (d) => {
  if (!/^[Mm][MmLlHhVvZzCcSsQqTtAa\d.eE+,\s-]+$/.test(d)) throw new Error(`Invalid path data: ${d}`);
  return `<path d="${d}"/>`;
};
export const c = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
export const r = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''}/>`;
export const g = (transform, value) => `<g transform="${transform}">${svg(value)}</g>`;
export const svg = (value) => value.startsWith('<') ? value : p(value);

// The detail is animated when present. Otherwise the entire outline moves.
export const icon = (name, outline, detail, motion, minimal = outline) => ({ name, outline, detail, motion, minimal });
