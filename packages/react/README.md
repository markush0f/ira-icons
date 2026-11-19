# @ira-icons/react

React adapter for the original `icons/*.svg` files. Like the Astro adapter, it uses `import.meta.glob` and `@ira-icons/core` to discover and validate the catalog. There is no generated JavaScript, copied SVG markup, or separate icon build step.

## Setup (React + Vite)

This package is currently workspace-only, like `@ira-icons/astro`; it is not a standalone npm package. Its SVG imports refer to this repository's `icons/` directory.

Add `"@ira-icons/react": "workspace:*"` to the consuming workspace's dependencies. Install React 18 or 19, Vite, and `vite-plugin-svgr`, then run `bun install`.

Configure SVGR alongside your existing React plugin in `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr({ svgrOptions: { ref: true } })],
  resolve: { dedupe: ['react', 'react-dom'] },
});
```

SVGR turns the `?react` SVG imports into React components during Vite's normal pipeline. `ref: true` enables forwarding refs to the SVG element. Deduplication makes SVGs outside the app directory resolve the same React instance as the app. For Vite SSR, also set `ssr: { noExternal: ['@ira-icons/react'] }` so Vite processes the adapter's imports.

This adapter requires Vite and SVGR; it does not currently support Next.js or other bundlers out of the box.

## Usage

```tsx
import Icon from '@ira-icons/react';

export function Toolbar() {
  return (
    <>
      <Icon name="search" size={32} color="#6339b8" label="Search" />
      <button aria-label="Favorite">
        <Icon name="heart" />
      </button>
    </>
  );
}
```

The API matches Astro: `name`, `size` (24 by default), `color` (`currentColor` by default), and `label`. Standard SVG props such as `className`, `style`, `strokeWidth`, events, and `ref` are also supported. Explicit `width` and `height` override `size`.

Without a label, icons are decorative (`aria-hidden`). Use `label`, `aria-label`, or `aria-labelledby` when the SVG needs its own accessible name. Label a surrounding button instead when appropriate.

```js
import { iconNames } from '@ira-icons/react/names';
```

The catalog eagerly loads all icons, just like the Astro adapter. Unknown names throw an error at render time. TypeScript declarations describe the component props; names are strings validated at runtime, not a generated type union.

## Tests

Run `bun run test` from the repository root. Tests exercise the real Vite/SVGR imports, every original SVG, accessibility, SVG props, a production browser bundle, and TypeScript usage.
