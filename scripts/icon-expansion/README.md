# Icon Expansion

This directory contains the source definitions for the 300-family catalog expansion. The generator turns each family into three SVGs in [`icons/`](../../icons/): original (`name.svg`), minimalist (`name-minimalist.svg`), and animated (`name-animated.svg`).

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
