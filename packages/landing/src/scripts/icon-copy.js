const jsxAttributes = {
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
};

export function formatIcon(preview, name, format) {
  const svg = preview.cloneNode(true);
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");

  // Astro components can use SVG markup directly; React needs JSX attribute names.
  if (format === "React") {
    for (const element of [svg, ...svg.querySelectorAll("*")]) {
      for (const [svgName, jsxName] of Object.entries(jsxAttributes)) {
        if (!element.hasAttribute(svgName)) continue;
        element.setAttribute(jsxName, element.getAttribute(svgName));
        element.removeAttribute(svgName);
      }
    }
  }

  let markup = new XMLSerializer().serializeToString(svg);
  if (format === "React") {
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

  const component = name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  return `import * as React from "react";\n\nexport default function ${component}Icon() {\n  return (\n    ${markup}\n  );\n}\n`;
}
