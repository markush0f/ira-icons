# Scripts

The shared catalog lives in `packages/core/icons.mjs`; Astro and React load the source SVGs through `packages/astro/icons.mjs` and `packages/react/icons.mjs`, respectively. Neither adapter needs a code generation step when running the app.

## Draft one icon

[Icon Studio tools](icon-studio/README.md) search the catalog and turn a structured proposal into a validated SVG draft and review sheet. They do not modify the catalog. Drafts can be written by hand or requested from Gemini using a private environment variable.

## Icon collection

`icon-expansion/` contains the source definitions for the 300-family expansion, organized by category. Each definition describes the main outline, optional animated detail, motion, and minimalist geometry. Run `node scripts/icon-expansion/generate.mjs` to update the generated SVGs and standalone catalog. Use `--check` to verify that the outputs are current. SVGs without the generator marker are never overwritten.
