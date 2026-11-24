import { fileURLToPath } from "node:url";
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
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
  // Keep pages prerendered; generation and report API routes run on demand.
  // Vercel needs serverless output, while local/standalone builds use Node.
  adapter: process.env.VERCEL === "1" ? vercel() : node({ mode: "standalone" }),
  prefetch: { prefetchAll: false },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false },
  },
  env: {
    schema: {
      GEMINI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      GEMINI_MODEL: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
