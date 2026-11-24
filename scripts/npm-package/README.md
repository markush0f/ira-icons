# Ira Icons

Outline SVG icons in original, minimalist, and animated styles, with components for React, Astro, Vue, and Svelte. Use the React adapter in Next.js.

```sh
npm install @ira-icons/iraicons
```

## React 18 or 19

```jsx
import { SearchMinimalist } from '@ira-icons/iraicons/react';

<SearchMinimalist size={24} label="Search" />
```

To load just one icon directly, use `import SearchMinimalist from '@ira-icons/iraicons/react/search-minimalist'`. For dynamic names, the default `Icon` export still supports `<Icon name="search-minimalist" />`.

No Vite or SVGR configuration is required. The package includes React TypeScript declarations.

## Next.js (App Router)

Use the React export directly in a server component such as `app/page.jsx`. No `'use client'` directive or SVG loader is needed.

```jsx
import SearchMinimalist from '@ira-icons/iraicons/react/search-minimalist';

export default function Page() {
  return <SearchMinimalist size={24} label="Search" />;
}
```

## Astro 7

```astro
---
import SearchMinimalist from '@ira-icons/iraicons/astro/search-minimalist';
---

<SearchMinimalist size={24} label="Search" />
```

The default export from `@ira-icons/iraicons/astro` still supports dynamic names with `<Icon name="search-minimalist" />`.

## Vue 3

```vue
<script setup>
import { SearchMinimalist } from '@ira-icons/iraicons/vue';
</script>

<template>
  <SearchMinimalist :size="24" label="Search" />
</template>
```

## Svelte 5

```svelte
<script>
  import { SearchMinimalist } from '@ira-icons/iraicons/svelte';
</script>

<SearchMinimalist size={24} label="Search" />
```

Both adapters have an individual import such as `/vue/search-minimalist` or `/svelte/search-minimalist`. Use the default `Icon` export from `/vue` or `/svelte` with `name="search-minimalist"` for dynamic names. Svelte uses your app's Svelte compiler; Vue components are precompiled.

Omit `label` when the icon is decorative. `size` defaults to 24 and `color` defaults to `currentColor`.

Animated components accept a numeric `speed` multiplier in all adapters. `1` is the default, `2` is twice as fast, and `0.5` is half speed. Invalid values fall back to `1`; static icons ignore it. They also accept `constant`, which defaults to `true` and keeps each icon’s animation looping. Set `constant={false}` to play the cycle once. Reduced-motion preferences still apply.

```jsx
import { ArrowBackAnimated } from '@ira-icons/iraicons/react';

<ArrowBackAnimated size={24} color="#663399" speed={1.5} />
```

In Vue templates, pass a number with `:speed="1.5"`.

## SVG files

The package ships the original SVG files under `icons/`. For example, in Vite you can import a URL:

```js
import searchUrl from '@ira-icons/iraicons/icons/search.svg?url';
```

For plain HTML, copy the SVG file to your site's public assets or paste its markup inline.

## License

MIT. See `LICENSE` for Ira Icons and `LICENSE.tabler` for the retained Tabler Icons copyright and MIT notice.
