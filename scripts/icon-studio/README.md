# Icon Studio

Use these tools to draft **one new icon**, with three variants. They run on Node and never add files to `icons/`. Chrome/Chromium is optional for the browser audit. The `search` and `build` commands stay local; only `generate` calls Gemini. The CLI and Astro Create page share the JavaScript compiler and Gemini integration. To regenerate the existing expansion in bulk rather than draft a single icon, use [Icon Expansion](../icon-expansion/README.md).

```sh
# 1. Find nearby icons before drawing. Read the best matches for visual reference.
node scripts/icon-studio/icon-tool.mjs search 'desk lamp'

# 2. Build a proposal in a new draft directory.
draft=$(mktemp -d)
node scripts/icon-studio/icon-tool.mjs build scripts/icon-studio/examples/metronome-study.json \
  --out "$draft/metronome" --browser google-chrome
```

Open `$draft/metronome/review.html`. It compares all three variants at **16, 20 and 24 px** on light and dark backgrounds. Omit `--browser` to build and review manually when Chrome is not installed. The command rejects existing catalog names and does not replace an existing output directory. Use a new output directory for revisions.

## Generate a proposal with Gemini

Use a private, newly issued API key. The following Bash example reads it without echoing it or putting it in the command history:

```sh
read -rsp 'Gemini API key: ' GEMINI_API_KEY
printf '\n'
export GEMINI_API_KEY

draft=$(mktemp -d)
node scripts/icon-studio/icon-tool.mjs generate 'A desk fan whose blades rotate' \
  --name desk-fan-study --out "$draft/desk-fan" --browser google-chrome

unset GEMINI_API_KEY
```

The default model is `gemini-3.1-flash-lite`. Use the optional environment variable `GEMINI_MODEL` only to choose another Gemini model ID that supports structured output. The command sends the description, the [shared design guide](../../.agents/skills/icon-designer/references/design-guide.md), and up to three catalog SVG references to Gemini; omit confidential or personal information. The key is sent only in the API request header and is never saved with the draft. If the request fails or validation rejects the result, nothing is added to the output directory.

Open the resulting `review.html`. To refine the result, edit `proposal.json` in the draft and run `build` into a new directory. Keep it out of the catalog until it has been reviewed.

## Model contract

Provide one JSON object, with exactly these fields:

| Field | Format |
| --- | --- |
| `name` | Unused English kebab-case base name; no `-minimalist` or `-animated` suffix. |
| `original` | 1–16 shapes, ordered back to front. |
| `minimalist` | 1–16 shapes, with genuinely simpler geometry for the same concept. |
| `motion` | 1–6 effects, each applied to a different shape ID from `original`. The animated variant keeps the other shapes still. |

Shape objects use `id` (unique in the variant) and `type`. A `path` accepts `d`, a `circle` accepts `cx`, `cy` and `r`, and a `rect` accepts `x`, `y`, `width`, `height`, and optional `rx`. Work inside a 24 × 24 viewport, allowing space for the stroke and motion. The compiler adds the root attributes and styles: no SVG markup, CSS, URLs, IDs for DOM selectors, or script fragments are accepted in the specification.

Each motion has `target` and `effect`. Available effects are `draw` (path only), `swing`, `spin`, `rise`, `drop`, and `pulse`. Set an `[x, y]` `origin` for `swing` and `spin`. Optional `durationMs` defaults to 2600 (range 700–8000); `delayMs` defaults to zero and is limited to one cycle in either direction. Scope motion to the part that explains the icon: a pointer swings at its axle, droplets fall, and only the series of a chart draws. Do not use `draw` on unrelated outlines. The compiler isolates styles per icon and disables motion when reduced motion is requested.

See [metronome](examples/metronome-study.json), [trend](examples/trend-study.json) and [shower](examples/shower-study.json) for three distinct motion patterns. These are test proposals, not new catalog icons.

## Review and revise

- If the command reports an error, fix the JSON and rebuild. It checks structured input and runs the existing single-icon SVG checker. With `--browser`, it also detects malformed paths, empty geometry, missing CSS animation and possible clipping in static geometry or sampled animation frames. It is not a guarantee that every frame looks good.
- Open the sheet and decide whether the icon reads clearly at 16 px. Check light/dark, the loop reset, and reduced motion. If the animation distracts from the meaning, change the target or timing, not just the whole outer shape.
- When the draft is approved and inclusion is requested, follow the [catalog integration steps](../../.agents/skills/icon-designer/references/repository-workflow.md). Nothing is published automatically. The generator is a local drafting tool, not a public preview service or a sanitizer for uploaded SVG.

Run the tool's regression checks with `bun run test:icon-tools`.
