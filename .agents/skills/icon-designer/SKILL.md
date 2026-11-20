
---
name: icon-designer
description: Generate, edit, preview and validate original SVG icons for a reusable icon library.
---

# Icon Designer

## Design rules

- Create original SVG icons.
- Use a 24x24 viewBox.
- Use consistent 2px strokes.
- Use round line caps and joins.
- Use currentColor.
- Avoid unnecessary paths.
- Maintain consistent optical alignment.
- Follow the style of existing approved icons.

## Workflow

1. Inspect existing icons before generating new ones.
2. Generate vector geometry using the available coding model.
3. Use Inkscape MCP when vector editing is needed.
4. Render and visually inspect each SVG.
5. Optimize SVG files with SVGO.
6. Validate icons at 16px, 20px and 24px.
7. Save approved icons using kebab-case filenames.

## Restrictions

- Never copy existing commercial icon designs.
- Never use paid image generation services.
- Never overwrite approved icons without permission.
- Always preserve the library's visual identity.
