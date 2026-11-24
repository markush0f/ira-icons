---
name: icon-refiner
description: Refine the motion or catalog categories of existing Ira Icons. Use for a single existing icon or a category batch, not for creating new icons.
---

# Ira Icons — Refine existing icons

1. **Scope the batch.** List the families that actually appear in the category via `categoriesFor` in `scripts/icon-expansion/categories.ts`. Inspect nearby icons that are missing or misplaced. Categorize by what the icon depicts or does, not a word or detail it contains: a file with an arrow is still a document, and a UI chevron is not necessarily a map icon. Keep meaningful secondary categories. Add inclusion/exclusion tests in `web/test/icon-categories.test.ts`.
2. **Preserve the icon.** Keep public names, original/minimalist assets, license notices, viewBox, and `currentColor`. Edit generator sources for generated assets and regenerate with `node scripts/icon-expansion/generate.ts`. Change a handwritten animated SVG directly unless its family is explicitly adopted by a generator. Never hand-edit a generated SVG.
3. **Animate the concept, not a random detail.** Apply the instruction for the requested family. Keep motion scoped to the icon (selectors **and** keyframes), within `prefers-reduced-motion: no-preference`. Without CSS or with reduced motion, show the full static icon. Keep the SVG self-contained and pause visibly on the completed pose before resetting, unless the family calls for a continuous loop.
4. **Review the result.** In a browser, sample the beginning, middle, hold and reset at 16, 20 and 24 px, light and dark; compare the completed and reduced-motion poses to the original. Put several variants inline together to catch CSS leakage. For large batches, render-compare all static poses and visually inspect a sample covering every motion pattern. Run `node scripts/icon-expansion/generate.ts --check`, `bun run test`, `bun run build`, and `git diff --check`. Report the scope, what changed, and what was verified.

## Global rule: every line icon is drawn progressively

The user explicitly confirmed this applies to **all** line icons, including animals, gears, bells, hearts, and other formerly moving subjects. Replace body gestures, spins, pulses, geometric deformations, and clipping sweeps with real stroke tracing. Original and minimalist assets remain unchanged.

- Use the arrow principle: begin each stroke at its actual endpoint, follow its route, accumulate completed strokes, hold the finished icon, then fade before restarting. Split disconnected subpaths so each pen stroke has its own origin.
- Keep curated arrow routes/head ordering and the established circle/table/box/chart timelines. Trace chart axes too. Dashed/dotted circles trace their individual marks clockwise instead of using a clipping sweep.
- The fallback in `scripts/icon-expansion/stroke-reveal.ts` draws strokes sequentially during 0–47% of a **2.65 s** loop, holds through 88%, and scopes every selector/keyframe by icon name. Filled details keep their original fill only as the stroke completes. Reduced motion shows the full original pose.
- `generate.ts` now owns every animated variant, including legacy icons. Do not edit generated SVGs by hand or re-enable legacy motion plans as the fallback.

## Arrows & directions: trace the route from origin to destination

**Start at the free end of the shaft (the tail), follow the route, and draw the arrowhead last.** For `arrow-back`, that means the short upper end appears first, the line curves around to the right and travels left, and only then do the two arms form the left-pointing head. Starting on either arm of the head is already starting at the destination, even if the vertex is still hidden.

- Use `pathLength="1"` and animate dash offset from `1` to `0` for a path authored origin-first, or from `-1` to `0` for one authored destination-first. Check an early frame: only the origin of the route should be drawn, not the head. Check a later frame to verify the line reaches the destination before the head appears.
- Trace incoming branches before the joined route and multiple equivalent routes together. Double chevrons have no shaft: reveal the trailing chevron before the leading one. For a thick outline, start at the back of the body, then draw the shoulders into the nose.
- Reveal posts, stops, and badges as stationary references without using them as a substitute for tracing the route. Keep the full pose visible without animation.
- See `scripts/icon-expansion/arrow-reveal.ts`: `arrow-back` is the curved reference, `arrow-right` the straight one, and `arrows-split` the branched one.

**Arrow timing (2.65 s cycle):** for a simple arrow, draw the shaft at 0–30% (~0.80 s), then the head at 30–47%. For a branched arrow, draw the incoming branches at 0–15%, the shaft at 15–33% (~0.48 s), and the head at 33–50%. Keep the head's duration unchanged. Hold the complete pose through 88%, then fade before restarting.

## Design & data: charts and tables

- **Charts:** trace the data from its actual first point to its last, normally left to right. Draw bars from their baseline. Trace axes and frames too, without moving their geometry. Use individual paths and animate their dash offset; never use a clipping sweep as a substitute for drawing a line. For complete circular outlines, apply [Circular reveals](../icon-circular-reveal/SKILL.md).
- **Tables:** start with the header and stagger the rows from top to bottom. Each divider draws from its own endpoint, not from where a sweep intersects it. Keep completed rows visible as the next ones draw. See `table` and `table-plus` in `scripts/icon-expansion/design-reveal.ts`.

Use these linear loop timings from `scripts/icon-expansion/design-reveal.ts`:

| Family | Cycle | Drawing phases |
| --- | --- | --- |
| Charts | **2.8 s** | Continuous lines: 0–49% (~1.37 s). Staggered bars or points: 0–24%, 12–36%, 24–48%. Keep circular charts and their interior strokes on the shared 0–49% timing. |
| Tables | **2.4 s** | Top, middle, and bottom bands: 0–30%, 12–42%, 24–54%. The last band finishes by ~1.30 s. |
| Circles | **2.4 s** | Ring and interior lines: 0–49% together (~1.18 s). See [Circular reveals](../icon-circular-reveal/SKILL.md). |

Hold completed strokes through 87% of the cycle, then fade them out before restarting. The full pose stays visible under reduced motion.

## Boxes, squares, and rectangular frames: accumulate strokes like tables

- Apply progressive tracing to box-like icons throughout the catalog, not only the code category: squares, rectangular frames, terminals, windows, files, folders, containers, packages, and cubes.
- Preserve the outlined design; “filling in” means drawing the existing strokes, not adding solid fills. Keep original and minimalist variants unchanged.
- Use the table family's **2.4 s linear loop**: draw upper, middle, and lower strokes at 0–30%, 12–42%, and 24–54%, hold the completed pose through 87%, then fade before restarting. Disconnected strokes begin at their own endpoints.
- See `scripts/icon-expansion/box-reveal.ts` for geometry-based recognition and `design-reveal.ts` for rendering. Reduced motion must show the complete original silhouette.

## Animals: follow the same global tracing rule

Animals and their body parts now use the same progressive stroke reveal as other line icons. Do not restore blinking, flapping, or joint motion unless the user explicitly requests an exception to the global rule.

Record new family-specific rules here once the user confirms them. Do not turn a rule for one family into a default for unrelated icons.
