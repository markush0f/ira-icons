# Ira Icons

Colección inicial de 10 iconos SVG de trazo (outline). Los originales están en [`icons/`](icons/).

## Landing en Astro

Con Node.js **22.23.4 o posterior** y pnpm (si tienes Corepack pero no el comando `pnpm`, ejecuta `corepack enable pnpm`):

```sh
pnpm install
pnpm dev
```

La landing está en [`packages/landing/`](packages/landing/). Usa Astro y CSS nativo, sin TypeScript ni JavaScript de cliente añadido. Para compilarla, ejecuta `pnpm build`.

El catálogo importa los iconos de `packages/astro/`. Los paquetes `packages/react/` y `packages/core/` todavía están reservados para futuras distribuciones.

## Uso en Astro

`@ira-icons/astro` ya se puede usar dentro del workspace, pero aún no se publica en npm. Importa un solo componente y selecciona el icono con `name`:

```astro
---
import Icon from '@ira-icons/astro';
---

<Icon name="search" size={24} label="Buscar" />
```

El tamaño predeterminado es 24 px. Omite `label` para iconos decorativos o si el control que contiene el icono ya tiene una etiqueta accesible. Los SVG heredan el color del texto.

## Vista previa original

También puedes abrir [`index.html`](index.html) directamente en el navegador para comparar los SVG originales sin levantar un servidor.

## Uso en HTML

```html
<img src="icons/search.svg" width="24" height="24" alt="Buscar">
```

Usa `alt=""` si el icono es decorativo. Si es el único contenido de un botón, etiqueta el botón (por ejemplo, `aria-label="Buscar"`). Para que el icono herede el color del texto mediante `currentColor`, inserta el SVG directamente en el HTML: un SVG cargado con `<img>` no hereda el color de la página.

## Añadir un icono

1. Guarda un SVG en `icons/` con un nombre en minúsculas y separado por guiones, como `arrow-up.svg`.
2. Usa `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"` y extremos y uniones redondeados.
3. Arranca `pnpm dev` o ejecuta `pnpm build`: ambos regeneran el registro y el icono aparece en el catálogo sin tocar la landing. Si el servidor de desarrollo ya está en marcha, ejecuta `pnpm generate:astro` para actualizar el registro.

Si quieres que el icono aparezca también en la vista previa original, añade su nombre a `index.html`.
