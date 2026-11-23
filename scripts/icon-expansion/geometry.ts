import type { MotionPlan } from './motion-plan.ts';

export interface IconDefinition {
  name: string;
  outline: string;
  detail: string | null;
  motion: string;
  minimal: string;
  notice?: string;
  sequence?: MotionPlan | null;
}

export const p = (d: string) => {
  if (!/^[Mm][MmLlHhVvZzCcSsQqTtAa\d.eE+,\s-]+$/.test(d)) throw new Error(`Invalid path data: ${d}`);
  return `<path d="${d}"/>`;
};
export const c = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
export const r = (x: number, y: number, w: number, h: number, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''}/>`;
export const g = (transform: string, value: string) => `<g transform="${transform}">${svg(value)}</g>`;
export const svg = (value: string) => value.startsWith('<') ? value : p(value);

// The detail is animated when present. Otherwise the entire outline moves.
export const icon = (name: string, outline: string, detail: string | null, motion: string, minimal = outline): IconDefinition => ({ name, outline, detail, motion, minimal });
