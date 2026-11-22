# Drawing and motion

Start with the [shared design guide](design-guide.md) for silhouette, simplification, and motion. Icon Studio sends this same guide to Gemini.

For animation implementation examples, see `bell-animated.svg`, `coffee-animated.svg`, `heart-animated.svg`, `check-animated.svg`, and `chart-line-animated.svg` in `icons/`. Consider staggering separate droplets or splitting disconnected paths when they need different timing.

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
