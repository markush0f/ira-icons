import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  // Keep the catalog and installation guide prerendered. Only the report route runs on demand.
  adapter: node({ mode: "standalone" }),
  prefetch: { prefetchAll: false },
});
