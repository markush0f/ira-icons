const jsxAttributes = {
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
};

export type CodeFormat = 'React' | 'Next.js' | 'Astro' | 'Vue' | 'Svelte' | 'SVG';

// Keep the markup readable without letting it terminate the component's script.
function templateLiteral(markup: string) {
  return '`' + markup.replaceAll('\\', '\\\\').replaceAll('`', '\\`')
    .replaceAll('${', '\\${').replace(/<(?=\/script\b)/gi, '\\x3c') + '`';
}

export function formatIcon(preview: SVGSVGElement, name: string, format: CodeFormat) {
  const isJsx = format === 'React' || format === 'Next.js';
  const svg = preview.cloneNode(true) as SVGSVGElement;
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");

  // Astro components can use SVG markup directly; React needs JSX attribute names.
  if (isJsx) {
    for (const element of [svg, ...svg.querySelectorAll("*")]) {
      for (const [svgName, jsxName] of Object.entries(jsxAttributes)) {
        if (!element.hasAttribute(svgName)) continue;
        element.setAttribute(jsxName, element.getAttribute(svgName)!);
        element.removeAttribute(svgName);
      }
    }
  }

  let markup = new XMLSerializer().serializeToString(svg);
  if (isJsx) {
    // CSS braces inside a JSX child must be part of a string expression.
    markup = markup.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) =>
      `<style>{${JSON.stringify(css)}}</style>`);
  }
  if (format === "Astro") {
    const color = svg.getAttribute("color") ?? "currentColor";
    const componentMarkup = markup.replaceAll("<style>", "<style is:inline>").replace(/^<svg\b[^>]*>/, (tag) => tag
      .replace('width="24"', "width={size}")
      .replace('height="24"', "height={size}")
      .replace(/ color="[^"]*"/, " color={color}"));
    return `---\nconst { size = 24, color = ${JSON.stringify(color)} } = Astro.props;\n---\n\n${componentMarkup}\n`;
  }
  if (format === "SVG") return markup;
  if (format === 'Vue') {
    // Vue ignores literal <style> tags in templates. Keep SVG-local CSS in its drawing.
    const opening = markup.indexOf('>');
    const drawing = markup.slice(opening + 1, markup.lastIndexOf('</svg>'));
    return `<script setup lang="ts">\nconst drawing = ${templateLiteral(drawing)};\n</script>\n\n<template>\n  ${markup.slice(0, opening)} v-html="drawing"></svg>\n</template>\n`;
  }
  if (format === 'Svelte') {
    return `<script lang="ts">\nconst svg = ${templateLiteral(markup)};\n</script>\n\n{@html svg}\n`;
  }

  const component = name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  return `import * as React from "react";\n\nexport default function ${component}Icon() {\n  return (\n    ${markup}\n  );\n}\n`;
}
