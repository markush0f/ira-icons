import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  // Keep Astro and Vite caches in the root installation.
  cacheDir: "../node_modules/.astro",
  vite: { cacheDir: fileURLToPath(new URL("../node_modules/.vite-web/", import.meta.url)) },
  // Keep the catalog and installation guide prerendered. Only the report route runs on demand.
  adapter: node({ mode: "standalone" }),
  prefetch: { prefetchAll: false },
});
