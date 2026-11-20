# Ira Icons

Outline SVG icons in original and minimalist styles, with components for React and Astro.

## React 18 or 19

```jsx
import { SearchMinimalist } from '@markusss0s/ira-library/react';

<SearchMinimalist size={24} label="Search" />
```

To load just one icon directly, use `import SearchMinimalist from '@markusss0s/ira-library/react/search-minimalist'`. For dynamic names, the default `Icon` export still supports `<Icon name="search-minimalist" />`.

No Vite or SVGR configuration is required. The package includes React TypeScript declarations.

## Astro 7

```astro
---
import SearchMinimalist from '@markusss0s/ira-library/astro/search-minimalist';
---

<SearchMinimalist size={24} label="Search" />
```

The default export from `@markusss0s/ira-library/astro` still supports dynamic names with `<Icon name="search-minimalist" />`.

For React and Astro, omit `label` when the icon is decorative. `color` defaults to `currentColor`.

## SVG files

The package ships the original SVG files under `icons/`. For example, in Vite you can import a URL:

```js
import searchUrl from '@markusss0s/ira-library/icons/search.svg?url';
```

For plain HTML, copy the SVG file to your site's public assets or paste its markup inline.
