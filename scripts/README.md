# Scripts

`npm-package/build.mjs` builds the single npm distribution for Astro, React, Vue, and Svelte from the source SVGs. The landing uses its own local catalog in `web/src/icons/` and does not need the npm build. Both the landing and the React build use the catalog helper in `scripts/icon-catalog.mjs`.

## Draft one icon

[Icon Studio tools](icon-studio/README.md) search the catalog and turn a structured proposal into a validated SVG draft and review sheet. They do not modify the catalog. Drafts can be written by hand or requested from Gemini using a private environment variable.

## Icon collection

[Icon Expansion](icon-expansion/README.md) contains the source definitions for the 300-family expansion, organized by category. Each definition describes the main outline, optional animated detail, motion, and minimalist geometry. Run `node scripts/icon-expansion/generate.mjs` to update the generated SVGs and standalone catalog. Use `--check` to verify that the outputs are current. SVGs without the generator marker are never overwritten.
