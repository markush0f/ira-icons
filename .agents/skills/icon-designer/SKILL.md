---
name: icon-designer
description: Create one new original SVG icon for Ira Icons in its original, minimalist, and animated variants. Use only when the user asks for a single new icon.
---

# Ira Icons — Icon Designer

Create **one icon concept per invocation**, not a pack or a redesign of existing assets. One catalog icon has three versions: `<name>.svg` (original), `<name>-minimalist.svg`, and `<name>-animated.svg`. They must all depict the same thing.

## 1. Start with the catalog

- Identify the icon's subject or action, the visual cue that makes it recognizable, and what should move. Search `icons/` for that idea and its synonyms first. Compare a few nearby examples for silhouette, weight, and motion; don't create a second name for the same icon.
- Use English kebab-case names that describe the subject or action. `-minimalist` and `-animated` are reserved for style suffixes, not base names. Keep existing public names stable; do not silently overwrite, rename, or delete an approved icon.
- Draw original geometry; don't trace other icon packs or create a brand logo. Use the JavaScript tools or author SVG paths directly and check them in a local browser. Do not use paid generation services.

## 2. Draw the family

For a new draft, use the [internal icon tools](../../../scripts/icon-studio/README.md). Search the catalog by concept, then propose one JSON spec with original and minimalist geometry and named motion targets. Build to a temporary directory and optionally check its geometry with Chrome. Use the report to revise the draft; keep publication and integration separate. Direct SVG authoring is still an option for shapes or motion the tool cannot express.

1. **Original:** Start with a silhouette that reads at 16 px. Use a `0 0 24 24` viewBox, `width="24" height="24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, and round caps and joins. Start most outlines within roughly x/y 3–21; account for the stroke and the most extreme animation frame. Center optically, not by bounding box alone. Add only details that clarify meaning.
2. **Minimalist:** Simplify the drawing, not just the code: use fewer marks, more open space, and simpler corners. Preserve the identifying cues (including direction, state, or an action badge). Use the same viewBox, stroke weight, color behavior, and approximate scale. An identical copy or an arbitrary scale change is not a minimalist variant.
3. **Animated:** Preserve a recognizable static icon and animate the part that communicates the concept. A bell swings, its clapper can lag; a cup stays still while its steam rises; the axes of a chart stay visible while the series draws. Reserve stroke reveal for a simple line or a line detail, not every object. Use local CSS inside the SVG, scope selectors to this icon, and enable motion only under `prefers-reduced-motion: no-preference` so the base pose stays visible in reduced motion and without CSS.

Read [drawing and motion examples](references/drawing-and-motion.md) for geometry, correct pivots, stroke reveal, and animation review. Keep assets self-contained (no scripts, external fonts/resources, or `foreignObject`). Prefer small SVG primitives and presentation attributes to editor-specific markup.

## 3. Verify the new icon

From the repo root, pass just its base name. This checks the three SVG files and produces a local preview:

```sh
icon=your-icon-name
node .agents/skills/icon-designer/scripts/check-icons.ts "$icon" --sheet /tmp/ira-icon-review.html
```

Open the sheet in a browser. Compare the three versions at **16, 20, and 24 px** in light and dark. Watch two loops, including the most extreme position and the reset, then check the static pose in **reduced motion**. Also show the animated SVG inline alongside another icon to catch CSS leaking. Fix clipping or poor legibility before handing off. If a visual check isn't possible, say so.

## 4. Integrate and verify

Save the three new files in `icons/` and register the single new name as described in [repository integration](references/repository-workflow.md). Run `bun run test` and `bun run build`. Report the icon name, its three files, its animation, and what you checked. Do not edit existing icons, change package versions, commit, push, or publish unless asked.
