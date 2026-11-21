import { SVGPathData } from "svg-pathdata";

const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const PATH = /^[Mm][AaCcHhLlMmQqSsTtVvZz0-9eE.,+\-\s]+$/;
const ROOT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">';
const text = { type: "string" };
const number = { type: "number" };
const object = (properties, required = Object.keys(properties)) => ({
  type: "object", properties, required, additionalProperties: false,
});

// These definitions are used both for Gemini's structured response and for local validation.
const shapes = {
  path: object({ id: text, type: { type: "string", enum: ["path"] }, d: text }),
  circle: object({ id: text, type: { type: "string", enum: ["circle"] }, cx: number, cy: number, r: number }),
  rect: object({ id: text, type: { type: "string", enum: ["rect"] }, x: number, y: number, width: number, height: number, rx: number }, ["id", "type", "x", "y", "width", "height"]),
};
const effects = {
  draw: "0%, 8% { stroke-dashoffset: 1; opacity: 0; } 15%, 76% { opacity: 1; } 48%, 100% { stroke-dashoffset: 0; } 96%, 100% { opacity: 0; }",
  swing: "0%, 45%, 100% { transform: none; } 12% { transform: rotate(-12deg); } 26% { transform: rotate(8deg); } 36% { transform: rotate(-4deg); }",
  rise: "0% { transform: translateY(1px); opacity: .2; } 35%, 55% { opacity: 1; } 100% { transform: translateY(-2px); opacity: .2; }",
  drop: "0% { transform: translateY(-1px); opacity: .2; } 35%, 55% { opacity: 1; } 100% { transform: translateY(2px); opacity: .2; }",
  pulse: "0%, 62%, 100% { opacity: 1; } 32% { opacity: .5; }",
  spin: "to { transform: rotate(1turn); }",
};
const shapeList = { type: "array", minItems: 1, maxItems: 16, items: { anyOf: Object.values(shapes) } };
const motion = object({
  target: text,
  effect: { type: "string", enum: Object.keys(effects) },
  durationMs: number,
  delayMs: number,
  origin: { type: "array", items: number, minItems: 2, maxItems: 2 },
}, ["target", "effect"]);

export const proposalSchema = object({
  original: shapeList,
  minimalist: shapeList,
  motion: { type: "array", minItems: 1, maxItems: 6, items: motion },
});

function validateFields(value, schema) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || !schema.required.every((key) => Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !Object.hasOwn(schema.properties, key))) {
    throw new Error("Unexpected icon proposal fields");
  }
}

function coordinate(value, min = 0, max = 24) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error("Unexpected coordinate or timing");
  return value;
}

function viewport({ minX, minY, maxX, maxY }) {
  // The fixed round stroke adds one unit at each edge.
  for (const value of [minX, minY, maxX, maxY]) coordinate(value, 0.999, 23.001);
  if (maxX < minX || maxY < minY || (maxX === minX && maxY === minY)) {
    throw new Error("Empty icon geometry");
  }
}

function parseShapes(input) {
  if (!Array.isArray(input) || !input.length || input.length > 16) throw new Error("Invalid icon shape list");
  const parsed = new Map();
  for (const item of input) {
    const type = item?.type;
    if (typeof type !== "string" || !Object.hasOwn(shapes, type)) throw new Error("Unsupported SVG shape");
    validateFields(item, shapes[type]);
    if (typeof item.id !== "string" || item.id.length > 64 || !ID.test(item.id) || parsed.has(item.id)) {
      throw new Error("Invalid or duplicate shape ID");
    }

    let geometry;
    let bounds;
    if (type === "path") {
      if (typeof item.d !== "string" || item.d.length > 800 || !PATH.test(item.d)) throw new Error("Invalid SVG path data");
      const path = new SVGPathData(item.d);
      bounds = path.getBounds();
      geometry = { d: path.encode() };
    } else if (type === "circle") {
      const cx = coordinate(item.cx), cy = coordinate(item.cy), r = coordinate(item.r, 0.05);
      bounds = { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r };
      geometry = { cx, cy, r };
    } else {
      const x = coordinate(item.x), y = coordinate(item.y);
      const width = coordinate(item.width, 0.05), height = coordinate(item.height, 0.05);
      geometry = { x, y, width, height };
      if (Object.hasOwn(item, "rx")) geometry.rx = coordinate(item.rx, 0, Math.min(width, height) / 2);
      bounds = { minX: x, minY: y, maxX: x + width, maxY: y + height };
    }
    viewport(bounds);
    parsed.set(item.id, { type, geometry, bounds });
  }
  return parsed;
}

function checkMotionBounds(shape, effect, origin) {
  const { minX, minY, maxX, maxY } = shape.bounds;
  if (effect === "rise" || effect === "drop") {
    viewport({ minX, minY: minY - (effect === "rise" ? 2 : 1), maxX, maxY: maxY + (effect === "drop" ? 2 : 1) });
  }
  if (!origin) return;
  const [cx, cy] = origin;
  if (effect === "spin") {
    // Bound the whole rotation, not just its start and end.
    const radius = shape.type === "circle"
      ? Math.hypot(shape.geometry.cx - cx, shape.geometry.cy - cy) + shape.geometry.r
      : Math.hypot(Math.max(Math.abs(minX - cx), Math.abs(maxX - cx)), Math.max(Math.abs(minY - cy), Math.abs(maxY - cy)));
    viewport({ minX: cx - radius, minY: cy - radius, maxX: cx + radius, maxY: cy + radius });
  } else {
    for (let degrees = -12; degrees <= 8; degrees++) {
      const angle = degrees * Math.PI / 180;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      if (shape.type === "path") {
        viewport(new SVGPathData(shape.geometry.d).rotate(angle, cx, cy).getBounds());
      } else if (shape.type === "circle") {
        const x = cx + (shape.geometry.cx - cx) * cos - (shape.geometry.cy - cy) * sin;
        const y = cy + (shape.geometry.cx - cx) * sin + (shape.geometry.cy - cy) * cos;
        const r = shape.geometry.r;
        viewport({ minX: x - r, minY: y - r, maxX: x + r, maxY: y + r });
      } else {
        const xs = [], ys = [];
        for (const x of [minX, maxX]) for (const y of [minY, maxY]) {
          xs.push(cx + (x - cx) * cos - (y - cy) * sin);
          ys.push(cy + (x - cx) * sin + (y - cy) * cos);
        }
        viewport({ minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) });
      }
    }
  }
}

function shapeMarkup({ type, geometry }, extra = {}) {
  const attrs = Object.entries({ ...geometry, ...extra }).map(([key, value]) => `${key}="${value}"`).join(" ");
  return `    <${type} ${attrs}/>`;
}
const svg = (lines) => [ROOT, ...lines, "</svg>", ""].join("\n");

export function compileIcon(proposal, name) {
  if (typeof name !== "string" || name.length > 64 || !ID.test(name)) throw new Error("Invalid icon name");
  validateFields(proposal, proposalSchema);
  const original = parseShapes(proposal.original);
  const minimalist = parseShapes(proposal.minimalist);
  const base = svg([...original.values()].map((shape) => shapeMarkup(shape)));
  const simple = svg([...minimalist.values()].map((shape) => shapeMarkup(shape)));
  if (base === simple) throw new Error("Minimalist and original SVGs are identical");
  if (!Array.isArray(proposal.motion) || !proposal.motion.length || proposal.motion.length > 6) throw new Error("Invalid animation list");

  const rules = ["    <style>", "        @media (prefers-reduced-motion: no-preference) {"];
  const targets = new Map();
  for (const entry of proposal.motion) {
    validateFields(entry, motion);
    const { target, effect } = entry;
    const shape = original.get(target);
    if (!shape || targets.has(target) || typeof effect !== "string" || !Object.hasOwn(effects, effect)) throw new Error("Invalid motion target or effect");
    if (effect === "draw" && shape.type !== "path") throw new Error("Draw needs a path");
    const duration = coordinate(Object.hasOwn(entry, "durationMs") ? entry.durationMs : 2600, 700, 8000);
    const delay = coordinate(Object.hasOwn(entry, "delayMs") ? entry.delayMs : 0, -duration, duration);
    const declarations = [];
    let origin;
    if (effect === "spin" || effect === "swing") {
      if (!Array.isArray(entry.origin) || entry.origin.length !== 2) throw new Error("Missing rotation origin");
      origin = [coordinate(entry.origin[0]), coordinate(entry.origin[1])];
      declarations.push(`transform-origin: ${origin[0]}px ${origin[1]}px;`);
    } else if (Object.hasOwn(entry, "origin")) {
      throw new Error("Unexpected rotation origin");
    }
    checkMotionBounds(shape, effect, origin);

    const marker = `${name}--${target}`;
    const frames = `ira-${marker}`;
    const attrs = { "data-ira-motion": marker };
    if (effect === "draw") {
      attrs.pathLength = 1;
      declarations.push("stroke-dasharray: 1 2;");
    }
    const ease = ["spin", "drop", "rise"].includes(effect) ? "linear" : "ease-in-out";
    declarations.push(`animation: ${frames} ${duration}ms ${ease} ${delay}ms infinite;`);
    rules.push(`            @keyframes ${frames} { ${effects[effect]} }`);
    rules.push(`            [data-ira-motion="${marker}"] { ${declarations.join(" ")} }`);
    targets.set(target, attrs);
  }
  rules.push("        }", "    </style>");
  return {
    original: base,
    minimalist: simple,
    animated: svg(rules.concat([...original].map(([id, shape]) => shapeMarkup(shape, targets.get(id))))),
  };
}
