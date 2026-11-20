#!/usr/bin/env python3
"""Check one Ira Icons family and optionally write a browser review sheet."""

import argparse
from base64 import b64encode
from html import escape
from pathlib import Path
import re
from xml.etree import ElementTree as ET


ICONS = Path(__file__).resolve().parents[4] / "icons"
SVG = "{http://www.w3.org/2000/svg}"
VARIANTS = (("Original", ""), ("Minimalist", "-minimalist"), ("Animated", "-animated"))
NAME = re.compile(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*")
VIEWPORT = {
    "viewBox": "0 0 24 24",
    "width": "24",
    "height": "24",
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
}
DRAWABLE = {"path", "circle", "ellipse", "line", "polyline", "polygon", "rect", "text"}
ELEMENTS = DRAWABLE | {"svg", "g", "style", "defs", "clipPath", "mask"}
ANIMATION = re.compile(r"(?:^|[;{])\s*animation(?:-name)?\s*:", re.I)
MOTION_MEDIA = re.compile(r"@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)\s*\{", re.I)


def media_spans(css):
    """Locate the project's simple motion media blocks, not arbitrary CSS syntax."""
    for rule in MOTION_MEDIA.finditer(css):
        depth = 1
        for index in range(rule.end(), len(css)):
            depth += (css[index] == "{") - (css[index] == "}")
            if depth == 0:
                yield rule.end(), index
                break


def external_urls(text):
    references = re.findall(r"\burl\(([^)]*)\)", text, re.I)
    return any(not target.strip().strip("\"'").startswith("#") for target in references)


def geometry_signature(node):
    """Detect an exact copy of the static drawing, ignoring XML formatting."""
    attrs = tuple(sorted((key, value) for key, value in node.attrib.items() if not key.startswith("data-")))
    children = tuple(geometry_signature(child) for child in node if child.tag != SVG + "style")
    return node.tag, attrs, (node.text or "").strip(), children


def check_svg(file, animated):
    source = file.read_text(encoding="utf-8")
    if re.search(r"<!\s*(?:DOCTYPE|ENTITY)\b|<\?xml-stylesheet\b", source, re.I):
        raise ValueError("use self-contained SVG without DTDs, entities or external stylesheets")
    root = ET.fromstring(source)
    if root.tag != SVG + "svg":
        raise ValueError("expected an SVG root in the SVG namespace")
    for attr, expected in VIEWPORT.items():
        if root.get(attr) != expected:
            raise ValueError(f"expected {attr}={expected!r}, got {root.get(attr)!r}")

    styles = []
    drawables = 0
    for node in root.iter():
        tag = node.tag.removeprefix(SVG)
        if tag not in ELEMENTS:
            raise ValueError(f"unexpected element <{tag}>")
        if tag in DRAWABLE:
            drawables += 1
        if tag == "path" and not (node.get("d") or "").strip():
            raise ValueError("path without a d attribute")
        for attr, value in node.attrib.items():
            local = attr.rsplit("}", 1)[-1].lower()
            if local.startswith("on") or local in {"style", "base"}:
                raise ValueError(f"avoid inline scripts, styles and base URLs ({attr})")
            if (local in {"href", "src"} and not value.startswith("#")) or external_urls(value):
                raise ValueError(f"external reference in {attr}")
        if tag == "style":
            css = re.sub(r"/\*.*?\*/", "", node.text or "", flags=re.S)
            if re.search(r"@import\b", css, re.I) or external_urls(css):
                raise ValueError("external reference in embedded CSS")
            styles.append(css)
    if not drawables:
        raise ValueError("no drawable elements")

    declarations = 0
    for css in styles:
        spans = list(media_spans(css))
        for animation in ANIMATION.finditer(css):
            declarations += 1
            if not any(start <= animation.end() < end for start, end in spans):
                raise ValueError("animation declaration must be inside a no-preference motion block")
    if animated != bool(declarations):
        raise ValueError("animated variant needs CSS motion" if animated else "static variant must not animate")
    return source, geometry_signature(root)


def write_sheet(output, name, entries):
    def images(source, theme):
        # Standalone SVG images don't inherit color from the parent page.
        root = ET.fromstring(source)
        root.set("color", "#19151f" if theme == "light" else "#faf8ff")
        uri = b64encode(ET.tostring(root, encoding="utf-8")).decode("ascii")
        return "".join(
            f'<div><img src="data:image/svg+xml;base64,{uri}" width="{size}" height="{size}" alt=""><small>{size}</small></div>'
            for size in (16, 20, 24)
        )

    cards = []
    for theme in ("light", "dark"):
        for variant, source in entries:
            cards.append(f'<section class="{theme}"><h3>{variant} · {theme}</h3><div class="sizes">{images(source, theme)}</div></section>')
    section = f'<article><h2>{escape(name)}</h2><div class="variants">{"".join(cards)}</div></article>'

    html = """<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ira Icons · Review sheet</title>
<style>
body{font:15px system-ui,sans-serif;margin:24px;max-width:960px;background:#efedf2;color:#211d27}
article{margin:24px 0} h2{font:600 17px monospace} h3{font-size:12px;margin:0 0 12px}
.variants{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}
.variants section{padding:12px;border:1px solid #81778c;border-radius:8px}
.light{background:#fff;color:#19151f}.dark{background:#16131c;color:#faf8ff}
.sizes{display:flex;justify-content:space-around;gap:10px}.sizes>div{display:grid;justify-items:center;align-content:end;gap:6px;min-height:36px}
</style>
<h1>Ira Icons review sheet</h1>
<p>Compare 16, 20 and 24 px on both backgrounds. Observe the animated icons for two cycles and test again with reduced motion enabled.</p>
<p>Images are isolated. Also check inline SVGs together in the catalog for style conflicts.</p>
"""
    output.write_text(html + section + "\n</html>\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name", metavar="NAME", help="one base name, without a style suffix or extension")
    parser.add_argument("--sheet", type=Path, metavar="FILE", help="write an HTML sheet after the check passes")
    args = parser.parse_args()
    name = args.name
    if not NAME.fullmatch(name) or name.endswith(("-animated", "-minimalist")):
        parser.error(f"invalid base name: {name!r}")

    errors = []
    entries = []
    signatures = {}
    for variant, suffix in VARIANTS:
        file = ICONS / f"{name}{suffix}.svg"
        try:
            source, signature = check_svg(file, suffix == "-animated")
            entries.append((variant, source))
            signatures[variant] = signature
        except (OSError, ValueError, ET.ParseError) as error:
            errors.append(f"icons/{file.name}: {error}")
    if "Original" in signatures and signatures["Original"] == signatures.get("Minimalist"):
        errors.append(f"{name}: original and minimalist geometry are identical")

    if errors:
        parser.exit(1, "\n".join(errors) + "\n")
    print(f"Checked {name} ({len(VARIANTS)} SVGs).")
    if args.sheet:
        write_sheet(args.sheet, name, entries)
        print(f"Review sheet: {args.sheet}")


if __name__ == "__main__":
    main()
