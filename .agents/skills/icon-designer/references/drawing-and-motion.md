# Drawing and motion

Use this reference to draw, simplify, and animate the three versions of the new icon.

## Make the silhouette work first

| Check | What to look for |
| --- | --- |
| Recognition | At 16 px, the outline and one or two details still distinguish the icon from its neighbors. Search, zoom, and a generic circle should not look alike. |
| Stroke clearance | Check the actual rendered edge, including the 1 px each side of a 2 px stroke, rounded ends, corners, and all animated positions. Give parallel strokes enough room to stay separate at 16 px. |
| Optical scale | Compare adjacent icons at the same rendered size. Diagonals and round shapes often need different insets than squares to look equal. Avoid forcing every path into the same mathematical bounding box. |
| Coordinates | Start with whole or half units. Use fractional nudges only when they improve the render. Avoid stray control points, coincident strokes, and unnecessary groups. |
| Color | Inherit `currentColor`, including intentional filled accents. Check contrast in both themes. Do not bake preview colors, titles, backgrounds or accessibility labels into the source asset; consumers supply those. |

For the minimalist variant, remove redundant interior marks, simplify contours, and preserve meaning. Keep the arrowhead direction, disabled slash, or action badge even when other details go away. If the original has only one line, simplify its bends or proportions intentionally; do not merely reformat its path string.

## Choose motion by meaning

| Subject | Animate | Keep stable |
| --- | --- | --- |
| Bell, pendulum, dial | Rotation around the hinge or axle; add a small offset for an independently moving clapper if needed. | The mount, dial face, or housing. |
| Coffee, rain, sand | Short, staggered movement of wisps, droplets, or grains. Fade them before the loop restarts. | The cup, cloud, or hourglass outline. |
| Heart, flame, light | A heartbeat, flicker, or glow with a short rest. | The silhouette or baseline needed for recognition. |
| Arrow, check, waveform | Reveal a simple stroke in the intended direction. | Unrelated marks and decorative accents. |
| Chart or route | Reveal the series or route; split disconnected edges if they need different timing. | The axes, markers, and labels. |

Use the concrete examples already in the repo: `bell-animated.svg`, `coffee-animated.svg`, `heart-animated.svg`, `check-animated.svg`, and `chart-line-animated.svg`. Prefer a purposeful 1.5–3 second sequence when that timing suits the subject, with a clear rest or a smooth continuous loop. Don't make the whole catalog pulse or disappear at once.

### Scoped CSS and a useful static pose

- Put the normal, recognizable pose in SVG attributes. Don't hide an element in the markup and rely on animation to reveal it. Gate animated declarations with `@media (prefers-reduced-motion: no-preference)`.
- Inline `<style>` can affect the whole page, even when it is nested in an SVG. Target a unique asset marker such as `[data-ira-motion="example-hand"]`, or scope a child selector under a unique marker. Use `ira-`-prefixed keyframe names. Reuse shared keyframes only when all definitions are identical.
- Don't use document-wide IDs for animation selectors. An icon can appear more than once on a page. Prefer no IDs; if a paint server or clip is necessary, keep references local and verify repeated inline instances.
- For fixed pivots, set `transform-origin` in SVG position (e.g. `12px 5px` at a hinge). For deliberate center-based motion, use `transform-box: fill-box` with `transform-origin: center`. Check that these choices are correct when the icon is resized.
- For a dash reveal, put `pathLength="1"` on the specific drawable path. Set `stroke-dasharray: 1 2` only during the animation and animate `stroke-dashoffset` from 1 to 0. Keep the completed trace briefly visible; fade or otherwise conceal the reset. Treat compound subpaths as separate paths if simultaneous reveals look wrong.

Minimal CSS example (the rest of the SVG remains a normal static icon):

```svg
<style>
  @media (prefers-reduced-motion: no-preference) {
    @keyframes ira-example-trace {
      0% { stroke-dashoffset: 1; opacity: 0; }
      10%, 75% { opacity: 1; }
      45%, 100% { stroke-dashoffset: 0; }
      95%, 100% { opacity: 0; }
    }
    [data-ira-motion="example-trace"] {
      stroke-dasharray: 1 2;
      animation: ira-example-trace 2.6s ease-in-out infinite;
    }
  }
</style>
<path data-ira-motion="example-trace" pathLength="1" d="M4 15l5-5 4 3 7-7"/>
```

## Visual review

Look at the initial pose, the peak motion, the last pose, and the transition back to the start. Check silhouette at 16 px, tiny features at 20 px, and clipping or timing at 24 px. Test CSS inline alongside other icons (including two copies of the same icon), and with reduced motion enabled. Inkscape is useful for checking geometry; a browser is needed for CSS motion, inherited theme color, and duplicate inline instances. A bounding-box check is helpful for static clipping, but does not prove that strokes and transformed frames fit.
