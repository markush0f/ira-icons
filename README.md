# Ira Icons

An initial collection of 10 outline SVG icons. The source files live in [`icons/`](icons/).

## Astro landing page

Use **Bun** to install dependencies and run the workspace scripts. The Astro CLI runs on Node.js **22.23.4 or later**.

```sh
bun install
bun run dev
```

The landing page lives in [`packages/landing/`](packages/landing/) and uses Astro and plain CSS. Icon previews render as inline SVG; a small client script handles search and theme switching. Open the URL Astro prints in the terminal (usually <http://localhost:4321>). Run `bun run build` to build it.

Astro loads the original SVGs as components through Vite. `@ira-icons/core` validates their names and provides the shared catalog and lookup. There is no separate code generation step. React support is not implemented yet.

## Astro usage

`@ira-icons/astro` is available within the workspace but is not published to npm. Import a single component and select an icon with `name`:

```astro
---
import Icon from '@ira-icons/astro';
---

<Icon name="search" size={32} color="#6339b8" label="Search" />
```

The default size is 24 px. Set `size` and `color` to customize its dimensions and stroke color. Omit `label` for decorative icons or when the surrounding control already has an accessible name. By default, the SVG inherits the text color.

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
3. Run `bun run dev` or `bun run build` from the repository root. Astro discovers the new SVG without editing a list.

To include the icon in the standalone preview as well, add its name to `index.html`.

The React and Astro framework logos in the landing page are sourced from [SVGL](https://svgl.app/); the marks are trademarks of their respective owners.
