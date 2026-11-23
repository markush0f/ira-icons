import { fileURLToPath } from "node:url";
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import { svgCatalog, publishCatalogAssets } from './catalog-assets.ts';

export default defineConfig({
  // Keep Astro and Vite caches in the root installation.
  cacheDir: "../node_modules/.astro",
  integrations: [publishCatalogAssets],
  vite: {
    plugins: [svgCatalog],
    cacheDir: fileURLToPath(new URL("../node_modules/.vite-web/", import.meta.url)),
    envDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  // Keep the catalog and installation guide prerendered. Only the report route runs on demand.
  adapter: node({ mode: "standalone" }),
  prefetch: { prefetchAll: false },
  env: {
    schema: {
      GEMINI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      GEMINI_MODEL: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
