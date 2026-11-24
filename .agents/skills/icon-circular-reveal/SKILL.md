---
name: icon-circular-reveal
description: Animate circular geometry in Ira Icons. Use for complete rings, dashed circles, concentric circles, and circular icons with interior strokes.
---

# Circular reveals

- Start each circular outline at **12 o’clock** and trace it clockwise until it closes. For an offset circle, use the top of that individual circle, not the center of the icon. Don’t rotate the whole symbol or start at the SVG default of 3 o’clock.
- Use a top-start path with two clockwise arcs and `pathLength="1"`; animate `stroke-dashoffset` from `1` to `0`. For dotted or dashed rings, trace the existing marks individually in clockwise order from twelve; do not replace the marks or use a clipping/sector sweep. Use a negative dash offset for a counterclockwise-authored arc so its playback runs clockwise.
- Start interior lines **at the same time** as the ring. Each line draws continuously from one endpoint to the other. Split disconnected subpaths into independent strokes; in `circle-x` both diagonals start together and finish at their own opposite ends.
- **Timing:** use a **2.4 s linear loop**. Start the ring and interior strokes at 0%; finish drawing at 49% (~1.18 s), hold the complete pose through 87% (~2.09 s), then fade out before restarting. Circular charts use the chart family’s 2.8 s loop instead.
- Keep the source silhouette and fully drawn reduced-motion pose. Inspect an early frame: ink begins at the top of the ring and at an endpoint of each interior line. The completed pose should match the original.
- See `scripts/icon-expansion/design-reveal.ts` and the `circle-check`, `circle-x`, `circles`, and `circle-dotted` examples.
