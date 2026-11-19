# Ira Icons

A collection of 100 outline SVG icons. The source files live in [`icons/`](icons/).

## Astro landing page

Use **Bun** to install dependencies and run the workspace scripts. The Astro CLI runs on Node.js **22.23.4 or later**.

```sh
bun install
bun run dev
```

The landing page lives in [`packages/landing/`](packages/landing/) and uses Astro, JetBrains Mono, and plain CSS. The first icon is selected by default and its detail panel stays visible beside the catalog. Select another icon to update the panel. It includes a custom color picker with a HEX field and presets, plus framework documentation links. A small client script handles selection, search, theme switching, and color changes. Open the URL Astro prints in the terminal (usually <http://localhost:4321>). Run `bun run build` to build it.

Astro loads the original SVGs as components through Vite. `@ira-icons/core` validates their names and provides the shared catalog and lookup. Both adapters load the original SVGs through `import.meta.glob`, without a separate code generation step. React uses Vite with SVGR to import SVGs as React components.

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

The React and Astro framework logos in the landing page are sourced from [SVGL](https://svgl.app/); the marks are trademarks of their respective owners.
