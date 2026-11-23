# Icon Expansion

This directory contains the source definitions for the initial 300-family expansion and the 501-family Atlas collection. The generator turns each family into three SVGs in [`icons/`](../../icons/): original (`name.svg`), minimalist (`name-minimalist.svg`), and animated (`name-animated.svg`).

Open [the Atlas gallery](../../atlas.html) locally to browse just the new families and switch styles. Atlas combines wayfinding pictograms, device states, media controls and complete notation sets (dates, clocks, playing cards, dominoes, dice and keycaps). Its vector lettering does not require installed fonts.

After regenerating, run `node scripts/icon-expansion/atlas/review.mjs --gallery` to validate the new paths, rasterize every Atlas variant at 16, 24 and 48 px, check ink coverage, inspect the 48 px margins, reject identical original renders, and rebuild the offline gallery.

## Catalog categories

[`categories.mjs`](categories.mjs) assigns one or more category IDs to each family; all three variants share those categories. It uses source categories, additive rules, and explicit assignments for exceptions. Run `node --test web/test/icon-categories.test.mjs` after adding an icon to check coverage.

## Update a family

1. Edit its definition in the matching category file, such as [`commerce.mjs`](commerce.mjs) or [`weather.mjs`](weather.mjs). Edit the source definition, not the generated SVGs.
2. From the repository root, regenerate the SVGs and catalog metadata:

   ```sh
   node scripts/icon-expansion/generate.mjs
   ```

3. Review the diff and open [`index.html`](../../index.html) to compare the three variants. The generator also updates the icon count in the root README.

The generator refuses to overwrite SVGs that do not carry its generation marker.

## Check without writing

```sh
node scripts/icon-expansion/generate.mjs --check
```

This fails if a generated SVG is missing or out of date, or if the standalone icon list or README count is out of sync.

For drafting and reviewing **one** new icon without changing the catalog, use [Icon Studio](../icon-studio/README.md) instead.
