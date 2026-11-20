# Ira Icons

A collection of 412 icons in three styles: animated, minimalist, and original. All variants live in [`icons/`](icons/). Use the English icon name plus `-minimalist.svg` for the simplified version (for example, [`alarm-clock-minimalist.svg`](icons/alarm-clock-minimalist.svg)). In Astro or React, use `name="alarm-clock-minimalist"`.

Ira Icons is in active development. New icons and animations are added over time.

Many Ira Icons were designed with AI assistance. We test the SVGs for rendering, animation, and reduced-motion support.

## Animated variants

The catalog and [standalone preview](index.html) show one card per icon. Select an icon in the catalog to reveal **Animado**, **Minimalista**, and **Normal** next to the copy formats (below them on mobile). Animated is selected first. Use names such as `check-animated`, `map-pin-animated`, or `heart-animated` like any other icon:

```jsx
<Icon name="heart-animated" size={32} color="#c4416c" />
```

Simple line icons such as `check` and `activity` draw their strokes progressively. Other icons keep their own motion: the bell swings, the heart beats, and the clock ticks. All animations run without JavaScript and respect reduced-motion preferences.

Try `coffee-animated` for rising steam, `hourglass-animated` for falling sand, `scan-animated` for a moving scanner beam, or `waveform-animated` for a trace that draws itself.

## Astro landing page

Use **Bun** to install dependencies and run the workspace scripts. The Astro CLI runs on Node.js **22.23.4 or later**.

```sh
bun install
bun run dev
```

The landing page lives in [`packages/landing/`](packages/landing/) and uses Astro, JetBrains Mono, and plain CSS. `pages/index.astro` composes `SiteLayout`, `IconCatalog`, and `IconDetails`; the header, icon cards, copy buttons, and color picker live in separate components. Shared styles remain in `styles/global.css`, and `scripts/catalog.js` coordinates the catalog interactions. The first icon is selected by default and its detail panel stays visible beside the catalog. Select another icon to update the panel. Use the color picker to set the icon color, then choose React, Astro, or SVG under **Copy as** to copy the selected icon. The code is self-contained and keeps the preview color. A small client script handles selection, search, theme switching, and color changes. Open the URL Astro prints in the terminal (usually <http://localhost:4321>). Run `bun run build` to build it.

Astro loads the original SVGs as components through Vite. `@ira-icons/core` validates their names and provides the shared catalog and lookup. Both adapters load the original SVGs through `import.meta.glob`, without a separate code generation step. React uses Vite with SVGR to import SVGs as React components.

### Icon reports

Open a card and press **Report icon**. Astro handles the POST with its Node adapter; SQLite records the exact variant and a timestamp. No account or personal information is needed. The default database is `data/icon-reports.sqlite` relative to the process working directory (`packages/landing` when using `bun run dev`). The database is created on the first report and is not served publicly.

For production, run the Astro Node server after building and point it to a writable, persistent path:

```sh
bun run build
IRA_REPORTS_DB=/path/to/persistent/icon-reports.sqlite node packages/landing/dist/server/entry.mjs
```

The standalone `index.html` and static-only hosting do not support reports. Inspect the stored reports locally with `sqlite3 /path/to/persistent/icon-reports.sqlite 'SELECT icon_name, created_at FROM icon_reports ORDER BY id DESC;'`.

## Astro usage

`@ira-icons/astro` is available within the workspace but is not published to npm. Import a single component and select an icon with `name`:

```astro
---
import Icon from '@ira-icons/astro';
---

<Icon name="search" size={32} color="#6339b8" label="Search" />
```

The default size is 24 px. Set `size` and `color` to customize its dimensions and stroke color. Omit `label` for decorative icons or when the surrounding control already has an accessible name. By default, the SVG inherits the text color.

## React usage

`@ira-icons/react` supports React 18 and 19 in Vite projects with `vite-plugin-svgr`. Like Astro, it is currently workspace-only and uses the original SVG files directly:

```tsx
import Icon from '@ira-icons/react';

<Icon name="search" size={32} color="#6339b8" label="Search" />;
```

Configure `svgr({ svgrOptions: { ref: true } })` in Vite's plugins and `resolve: { dedupe: ['react', 'react-dom'] }`. See the [React package README](packages/react/README.md) for full setup, including SSR. No JavaScript source generation is needed.

Standard SVG props and refs are supported. Icons inherit text color and are decorative unless given a `label`, `aria-label`, or `aria-labelledby`. The catalog eagerly imports all icons, matching Astro's approach.

Run `bun run test` to check the Vite/SVGR integration, original SVGs, accessibility, production bundling, and TypeScript props.

## Build the installable package

From the repository root, run `bun install` and `bun run package:pack`. This creates `dist/markusss0s-ira-library-0.3.0.tgz` without publishing anything. From a separate project, install it with `npm install /absolute/path/to/markusss0s-ira-library-0.3.0.tgz`.

The tarball exposes `@markusss0s/ira-library/react` (also used by Next.js), `/astro`, `/vue`, `/svelte`, and `/icons/*.svg`. See the [package README](scripts/npm-package/README.md) for examples and single-icon imports. The React distribution is precompiled and doesn't require SVGR in the consuming app. Run `bun run test:adapters` to build and test the Vue and Svelte exports.

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
