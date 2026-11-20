# Scripts

The shared catalog lives in `packages/core/icons.mjs`; Astro and React load the source SVGs through `packages/astro/icons.mjs` and `packages/react/icons.mjs`, respectively. Neither adapter needs a code generation step when running the app.

## Icon collection

`icon-expansion/` contains the source definitions for the 300-family expansion, organized by category. Each definition describes the main outline, optional animated detail, motion, and minimalist geometry. Run `node scripts/icon-expansion/generate.mjs` to update the generated SVGs and standalone catalog. Use `--check` to verify that the outputs are current. SVGs without the generator marker are never overwritten.
