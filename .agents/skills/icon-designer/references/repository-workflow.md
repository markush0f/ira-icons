# Add one icon to Ira Icons

1. From the repository root, save the original, minimalist and animated SVGs in `icons/` under one unused name. Leave existing and generated SVGs unchanged. If using Inkscape, strip editor metadata and recheck the root attributes before saving.
2. Add the base name to the sorted list in the standalone `index.html` and increase the family count in `README.md` by one. Astro and React discover the three files automatically; don't edit their import lists. `node scripts/icon-expansion/generate.ts --check` verifies that the metadata still matches the catalog without rewriting any files.
3. Run the single-icon review command from the skill, then `bun run test` and `bun run build`. The review helper uses Node and the repository's installed JavaScript dependencies. It checks the three SVGs and writes a local HTML preview only when `--sheet` is passed. It does not validate all SVG geometry or replace the browser review.
4. In the running Astro catalog, use `/?q=<name>` to check the family and switch between its three styles. Use the URL Astro printed; if the icon is missing from a running dev site, restart only this project's dev server and try again.

If you optimize the new files, inspect the diff and repeat the checks. Preserve the viewBox, `currentColor`, `pathLength` and animation rules. Don't optimize unrelated assets or edit `dist/`.
