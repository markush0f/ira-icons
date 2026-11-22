# Ira Icons design guide

## Make the silhouette work first

- Draw on a 24 × 24 grid with a rounded 2-unit stroke. At 16 px, the outline and one or two details should distinguish the subject from nearby icons. Start with a recognizable silhouette, not with texture or decoration.
- Leave room for the stroke, rounded ends, and every animated position. Keep parallel strokes far enough apart to read as separate marks at 16 px.
- Match the catalog by apparent size and weight, not by forcing every shape into the same bounding box. Round shapes and diagonals can need different insets than squares.
- Start with whole or half units. Avoid coincident strokes, stray control points, and small details that disappear at 16 px. Inherit `currentColor`; do not bake in background colors, labels, or preview styling.

## Simplify without changing the subject

Remove redundant interior marks, simplify contours, and keep the distinctive detail that carries meaning. Preserve the direction of an arrow, a disabled slash, or an action badge when it is part of the meaning. If the original is already a single line, simplify its bends or proportions intentionally rather than just rewriting the path.

## Choose motion by meaning

| Subject | Animate | Keep stable |
| --- | --- | --- |
| Bell, pendulum, dial | Rotate a moving part around its hinge or axle. | Mount, dial face, or housing. |
| Coffee, rain, sand | Move wisps, droplets, or grains; fade them before the reset. | Cup, cloud, or hourglass. |
| Heart, flame, light | Use a pulse, flicker, or glow with a short rest. | The outline or baseline needed for recognition. |
| Arrow, check, waveform | Reveal a simple stroke in its intended direction. | Unrelated marks and accents. |
| Chart or route | Reveal the series or route. | Axes, markers, and labels. |

Keep a recognizable static pose. Prefer a purposeful 1.5–3 second sequence where it suits the subject, with a clear rest or a smooth continuous loop. Don't animate the whole drawing if motion on one part explains the subject. Review the silhouette at 16 px and the full motion at 24 px.
