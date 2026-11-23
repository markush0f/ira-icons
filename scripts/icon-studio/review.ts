import { SaxesParser } from "saxes";

import type { IconVariants } from '../../web/src/lib/icon-generation.ts';

export const variants = [
  ["original", "Original", ""], ["minimalist", "Minimalist", "-minimalist"], ["animated", "Animated", "-animated"],
] as const;
export const validName = (name: unknown): name is string => typeof name === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name) && !/-(animated|minimalist)$/.test(name);
const NS = "http://www.w3.org/2000/svg";
const geometry = new Set(["path", "circle", "ellipse", "line", "polyline", "polygon", "rect", "text"]);
const allowed = new Set(["svg", "g", "style", "defs", "clipPath", "mask", ...geometry]);
const rootAttributes = {
  viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor",
  "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round",
};

function externalUrl(text: string) {
  return [...text.matchAll(/\burl\(([^)]*)\)/gi)].some(([, value]) => !value.trim().replace(/^["']|["']$/g, "").startsWith("#"));
}

function checkStyle(source: string) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/@import\b/i.test(css) || externalUrl(css)) throw new Error("External reference in embedded CSS");
  const spans: [number, number][] = [];
  for (const media of css.matchAll(/@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)\s*\{/gi)) {
    const start = media.index + media[0].length;
    let depth = 1;
    for (let i = start; i < css.length; i++) {
      if (css[i] === "{") depth++;
      if (css[i] === "}" && --depth === 0) { spans.push([start, i]); break; }
    }
  }
  const declarations = [...css.matchAll(/(?:^|[;{])\s*animation(?:-name)?\s*:/gi)];
  if (declarations.some(({ index, 0: prefix }) => !spans.some(([start, end]) => start <= index + prefix.length && index + prefix.length < end))) {
    throw new Error("Motion needs a prefers-reduced-motion: no-preference block");
  }
  return declarations.length;
}

function inspect(source: string, animated: boolean) {
  const parser = new SaxesParser({ xmlns: true });
  let root = false, drawables = 0, motions = 0;
  let style: string | null = null;
  const signature: unknown[] = [];
  const fail = (error: Error): never => { throw error; };
  parser.on("error", fail);
  parser.on("doctype", () => fail(new Error("DTD is not allowed")));
  parser.on("processinginstruction", ({ target }) => {
    if (target === "xml-stylesheet") fail(new Error("External stylesheet is not allowed"));
  });
  parser.on("opentag", ({ local, uri, attributes }) => {
    if (uri !== NS || !allowed.has(local)) fail(new Error(`Unexpected SVG element: ${local}`));
    if (!root) {
      if (local !== "svg") fail(new Error("Expected an SVG root"));
      for (const [name, value] of Object.entries(rootAttributes)) {
        if (attributes[name]?.value !== value) fail(new Error(`Expected ${name}="${value}"`));
      }
      root = true;
    }
    if (geometry.has(local)) drawables++;
    if (local === "path" && !attributes.d?.value.trim()) fail(new Error("Missing path data"));
    for (const { local: key, value } of Object.values(attributes)) {
      const name = key.toLowerCase();
      if (name.startsWith("on") || ["style", "base"].includes(name)) fail(new Error(`Unexpected attribute ${key}`));
      if ((["href", "src"].includes(name) && !value.startsWith("#")) || externalUrl(value)) fail(new Error("External SVG reference"));
    }
    if (local === "style") style = "";
    else signature.push([local, Object.entries(attributes).filter(([key]) => !key.startsWith("data-")).sort().map(([key, info]) => [key, info.value])]);
  });
  const text = (content: string) => {
    if (style !== null) style += content;
    else if (content.trim()) signature.push(content.trim());
  };
  parser.on("text", text);
  parser.on("cdata", text);
  parser.on("closetag", ({ local }) => {
    if (local === "style") { motions += checkStyle(style ?? ''); style = null; }
    else signature.push("/" + local);
  });
  parser.write(source).close();
  if (!drawables) fail(new Error("No drawable elements"));
  if (Boolean(motions) !== animated) fail(new Error(animated ? "Animated variant needs CSS motion" : "Static variant must not animate"));
  return JSON.stringify(signature);
}

export function checkFamily(name: string, files: IconVariants) {
  if (!validName(name)) throw new Error("Use one lowercase kebab-case base name without a style suffix");
  const signatures = Object.fromEntries(variants.map(([key, , suffix]) => {
    try {
      return [key, inspect(files[key], key === "animated")];
    } catch (error) {
      throw new Error(`${name}${suffix}.svg: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }));
  if (signatures.original === signatures.minimalist) throw new Error("Original and minimalist geometry are identical");
}

export function reviewSheet(name: string, files: IconVariants) {
  const cards = ["light", "dark"].flatMap((theme) => variants.map(([key, label]) => {
    const color = theme === "light" ? "#19151f" : "#faf8ff";
    const colored = files[key].replace(/<svg\b([^>]*?)>/, (_: string, attributes: string) =>
      `<svg${attributes.replace(/\s+color\s*=\s*(?:"[^"]*"|'[^']*')/, "")} color="${color}">`
    );
    const uri = Buffer.from(colored).toString("base64");
    const samples = [16, 20, 24].map((size) => `<div><img src="data:image/svg+xml;base64,${uri}" width="${size}" height="${size}" alt=""><small>${size} px</small></div>`).join("");
    return `<section class="${theme}"><h2>${label} · ${theme}</h2><div class="sizes">${samples}</div></section>`;
  })).join("\n");
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} · Ira Icons review</title>
<style>
body { font: 15px system-ui,sans-serif; margin: 24px; max-width: 960px; background: #efedf2; color: #211d27 }
article { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px }
section { padding: 12px; border: 1px solid #81778c; border-radius: 8px }
h2 { font-size: 12px; margin: 0 0 12px }
.light { background: white; color: #19151f } .dark { background: #16131c; color: #faf8ff }
.sizes { display: flex; justify-content: space-around; gap: 10px }
.sizes > div { display: grid; justify-items: center; align-content: end; gap: 6px }
</style>
<h1>${name}</h1>
<p>Compare all three styles at 16, 20, and 24 px. Watch two loops and check reduced motion.</p>
<article>${cards}</article>
</html>
`;
}
