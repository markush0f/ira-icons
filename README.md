# Ira Icons

A collection of 3381 icons in three styles: animated, minimalist, and original. All variants live in [`icons/`](icons/). Use the English icon name plus `-minimalist.svg` for the simplified version (for example, [`alarm-clock-minimalist.svg`](icons/alarm-clock-minimalist.svg)). In Astro or React, use `name="alarm-clock-minimalist"`.

The catalog includes 2,048 pictograms adapted from [Tabler Icons 3.34.1](https://github.com/tabler/tabler-icons) ([MIT notice](scripts/icon-expansion/folio/TABLER-LICENSE.txt)), plus 320 original wind barbs and 100 original grid regions.

Ira Icons is in active development. New icons and animations are added over time.

Many Ira Icons were designed with AI assistance. We test the SVGs for rendering, animation, and reduced-motion support.

## Development checks

All maintained scripts and application modules use TypeScript with strict checking. Astro components keep their `.astro` extension; React sources use `.tsx`. Node.js runs CLI and test `.ts` files directly using native type stripping (Node 24.x).

```sh
bun run typecheck       # TypeScript and Astro diagnostics
bun run test            # React integration and web/server tests
bun run test:icon-tools # Icon compiler and CLI tests
bun run test:adapters   # Build and verify all framework packages
bun run test:consumers  # Install tarballs in temporary apps; build and render each framework
bun run build           # Production standalone Node build
bun run build:vercel    # Vercel static assets and serverless functions
bun run build:standalone # Refresh the generated script in index.html
```

The npm packages and standalone HTML still ship browser-compatible JavaScript. Edit their TypeScript sources, not generated output. The standalone script source is `scripts/standalone/catalog.ts`.

## Animated variants

The catalog and [standalone preview](index.html) show one card per icon. Select an icon in the catalog to reveal **Animated**, **Original**, and **Minimalist** next to the copy formats (below them on mobile; **Animado**, **Original**, and **Minimalista** in Spanish). Animated is selected first. Use names such as `check-animated`, `map-pin-animated`, or `heart-animated` like any other icon:

```jsx
<Icon name="heart-animated" size={32} color="#c4416c" />
```

All animated icons draw their strokes progressively, including animals, bells, hearts, and gears. Completed strokes accumulate, hold, then fade before restarting. Arrows trace the route before finishing the arrowhead; circles, tables, and rectangular frames retain their dedicated drawing sequences. All animations run without JavaScript and respect reduced-motion preferences.

## Astro landing page

Use **Bun** to install dependencies and run the workspace scripts. The Astro CLI runs on Node.js **24.x**.

```sh
bun install
bun run dev
```

The landing page lives in [`web/`](web/) and uses Astro, JetBrains Mono, and plain CSS. English is served at the unprefixed routes, and Spanish at `/es`. The header language switch keeps the current page. Interface copy lives in [`web/src/i18n/`](web/src/i18n/); icon filenames stay in English. `pages/index.astro` composes `SiteLayout`, `IconCatalog`, and `IconDetails`; the header, icon cards, copy buttons, and color picker live in separate components. Shared styles remain in `styles/global.css`, and `scripts/catalog.ts` coordinates the catalog interactions. The first icon is selected by default and its detail panel stays visible beside the catalog. Select another icon to update the panel. Choose React, Next.js, Astro, Vue, Svelte, or SVG under **Copy as** to copy the selected icon’s code directly. The code is self-contained and preserves the selected variant and color. A small client script handles selection, search, theme switching, and color changes. Open the URL Astro prints in the terminal (usually <http://localhost:4321>). Run `bun run build` to build it.

The landing loads the original SVGs through its local Astro component and Vite catalog in [`web/src/icons/`](web/src/icons/). The shared helper in [`scripts/icon-catalog.ts`](scripts/icon-catalog.ts) validates icon names and provides catalog lookup. The landing does not depend on building the npm distribution.

### Vercel deployment

Connect the repository to Vercel with the **repository root** as Root Directory and `main` as the production branch. The committed `vercel.json` selects Astro, installs with the frozen Bun lockfile, and runs `bun run build:vercel`. No dashboard command/output overrides are needed.

This command selects `@astrojs/vercel`, builds the application in `web/`, and publishes the complete Build Output API bundle to `.vercel/output/` at the repository root. Static pages and all icon assets are served alongside the API functions. Local development and `bun run build` retain the standalone Node adapter.

Keep `CREATE_COMING_SOON=true` (the default) for the public preview. Vercel's function filesystem is not persistent SQLite storage; do not enable icon reports there without first providing a suitable persistent backend.

### Icon studio

**Create** is currently a read-only preview. To test generation locally in the future, copy [`.env.example`](.env.example) to `.env` at the repository root, set `CREATE_COMING_SOON=false`, fill in `GEMINI_API_KEY`, and run `bun run dev`. Restart the dev server after changing `.env`.

Keep the key private; never prefix it with `PUBLIC_`. For production, set `CREATE_COMING_SOON=false` at build time and provide `GEMINI_API_KEY` to the Node server at runtime. If running the built server locally, use `node --env-file=.env web/dist/server/entry.mjs` from the repository root. The default model is `gemini-3.1-flash-lite`; set `GEMINI_MODEL` to override it.

The draft stays in the browser until **Generate with AI** is pressed. Astro sends the description and rendered catalog references to Gemini. It validates the original, asks Gemini to review a rendered preview, and then derives the minimalist and animated SVGs from the reviewed original. The visual review adds one provider request; if it fails, the last valid original is kept. The style selector only switches between available previews and never starts a generation. Users can preview and download them; nothing is automatically added to the catalog. The loading indicator respects reduced motion.

The generation route and the icon-designer skill share the TypeScript SVG compiler and Gemini client. Astro’s Node server handles generation without a separate worker. The route is disabled in *Coming soon* mode and limited to one concurrent request and ten generation requests per hour per Node process. Each step counts as one request. Keep it private or configure access controls and provider quotas before enabling it on a public deployment.

### Icon reports

Reports are disabled by default alongside generation through the shared `CREATE_COMING_SOON` flag: the form is hidden and the API returns 404 without opening SQLite. Set `CREATE_COMING_SOON=false` at build time to enable both features (and restart the dev server after changing `.env`). Enabling reports still requires the Node server described below.

When enabled, open a card and press **Report icon**. You can expand **Add a comment (optional)** first to include up to 500 characters. Astro handles the POST with its Node adapter; SQLite records the exact variant, a timestamp, and the optional comment. Existing databases gain the comment column automatically when the next report is saved. No account or personal information is needed. The default database is `data/icon-reports.sqlite` relative to the process working directory (`web/` when using `bun run dev`). The database is created on the first report and is not served publicly.

For production, run the Astro Node server after building and point it to a writable, persistent path:

```sh
bun run build
IRA_REPORTS_DB=/path/to/persistent/icon-reports.sqlite node web/dist/server/entry.mjs
```

The standalone `index.html` and static-only hosting do not support reports. Inspect the stored reports locally with `sqlite3 /path/to/persistent/icon-reports.sqlite 'SELECT icon_name, created_at, comment FROM icon_reports ORDER BY id DESC;'`.

## Astro usage

Import the component from the npm package and select an icon with `name`:

```astro
---
import Icon from '@ira-icons/iraicons-astro';
---

<Icon name="search" size={32} color="#6339b8" label="Search" />
```

The default size is 24 px. Set `size` and `color` to customize its dimensions and stroke color. Omit `label` for decorative icons or when the surrounding control already has an accessible name. By default, the SVG inherits the text color.

## React usage

The npm package supports React 18 and 19, with no SVGR configuration needed in the consuming app:

```tsx
import Icon from '@ira-icons/iraicons-react';

<Icon name="search" size={32} color="#6339b8" label="Search" />;
```

Standard SVG props and refs are supported. Icons inherit text color and are decorative unless given a `label`, `aria-label`, or `aria-labelledby`. Use an individual import, such as `@ira-icons/iraicons-react/search`, if you don't need the full catalog.

Run `bun run test` to check the Vite/SVGR integration, original SVGs, accessibility, production bundling, and TypeScript props.

## Build the installable package

From the repository root, run `bun install` and `bun run package:pack`. This creates five `.tgz` files in `dist/` without publishing anything. To test a local build, install the matching tarball in your app, for example `npm install /absolute/path/to/ira-icons-iraicons-astro-0.3.0.tgz`.

| Target | Package |
| --- | --- |
| React / Next.js | `@ira-icons/iraicons-react` |
| Astro | `@ira-icons/iraicons-astro` |
| Vue | `@ira-icons/iraicons-vue` |
| Svelte | `@ira-icons/iraicons-svelte` |
| All frameworks and raw SVGs | `@ira-icons/iraicons` |

The [complete package](scripts/npm-package/README.md) exposes imports like `@ira-icons/iraicons/astro` and `@ira-icons/iraicons/icons/search.svg`. Install `@ira-icons/iraicons`, not the import subpath. The complete package forwards framework entrypoints to its standalone dependencies and includes raw SVGs; individual icon imports belong to the standalone packages (for example, `@ira-icons/iraicons-react/search`). This keeps every published archive below the registry's file limits. All packages are generated from the same catalog; the legacy `@markusss0s/ira-library` build remains available in `dist/npm/`. Run `bun run test:adapters` to verify the generated packages.

### Consumer integration tests

`bun run test:consumers` builds and packs all five npm packages, installs the actual `.tgz` archives in a temporary workspace outside this repository, and tests React 19 + Vite, Next.js 16 App Router (Webpack), Astro 7, Vue 3 + Vite, and Svelte 5 + Vite. The fixtures use ordinary package imports without source aliases, symlinks, SVGR, or custom SVG loaders. Vue and Svelte use their normal Vite compiler plugins.

Each app imports both the standalone and complete packages. Tests build production output and check rendered SVG markup, dimensions, color, accessible labels, decorative icons, dynamic icon names, and animation CSS/speed. React, Vue, and Svelte also compile the browser bundle and execute the production SSR bundle; Astro and Next.js render their pages during static production builds. These are build/SSR smoke tests, not browser interaction or visual animation tests. They do not establish compatibility with every framework or every supported version (including React 18).

The command needs npm registry access to install the pinned consumer dependencies. Temporary projects are removed afterward; use `IRA_KEEP_CONSUMERS=1 bun run test:consumers` to retain them for inspection. Fixtures and the runner live in [`scripts/npm-package/test-consumers/`](scripts/npm-package/test-consumers/) and [`scripts/npm-package/test-consumers.ts`](scripts/npm-package/test-consumers.ts).

Framework components target React/Next.js, Astro, Vue, and Svelte only. Other frameworks can consume the raw SVG files, but do not have a dedicated component adapter or consumer test here.

### Publish to npm

An npm maintainer in the `ira-icons` organization can publish the tested tarballs:

```sh
npm login
bun run test:adapters
bun run package:pack
for framework in react astro vue svelte; do
  npm stage publish "./dist/ira-icons-iraicons-$framework-0.3.0.tgz" --access public
done
npm stage publish ./dist/ira-icons-iraicons-0.3.0.tgz --access public
npm stage list
# Review the archives, wait for validation, then approve the batch in npm.
```

The manifests explicitly set public access. Increase the version in `scripts/npm-package/package.json` before publishing subsequent releases; npm versions cannot be overwritten. Never commit npm credentials.

## License

[MIT](LICENSE), with the original MIT notices retained for icons adapted from Tabler Icons. Every published package includes both `LICENSE` and `LICENSE.tabler`.

## Standalone preview

Open [`index.html`](index.html) directly in a browser to compare the original SVGs without starting a server.

## HTML usage

```html
<img src="icons/search.svg" width="24" height="24" alt="Search">
```

Use `alt=""` for decorative icons. If the icon is the only content of a button, label the button itself (for example, with `aria-label="Search"`). To let the icon inherit text color via `currentColor`, inline the SVG: when loaded with `<img>`, it does not inherit the page's text color.

## Adding an icon

1. Save an SVG in `icons/` using a lowercase, hyphen-separated name such as `arrow-up.svg`.
2. Use `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, and rounded line caps and joins.
3. Run `bun run dev` or `bun run build` from the repository root for Astro, or start your React/Vite app. Both adapters discover the new SVG without editing a list or generating code.

To include the icon in the standalone preview as well, add its name to `index.html`.

The React, Astro, Next.js, Vue, Svelte, and GitHub logos in the landing page are sourced from [SVGL](https://svgl.app/); the marks are trademarks of their respective owners.
