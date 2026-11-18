# Ira Icons

Colección inicial de 10 iconos SVG de trazo (outline). Los originales están en [`icons/`](icons/).

## Vista previa

Abre [`index.html`](index.html) directamente en el navegador para comparar los iconos a **16, 24 y 32 px**. No necesitas instalar dependencias ni levantar un servidor.

## Uso en HTML

```html
<img src="icons/search.svg" width="24" height="24" alt="Buscar">
```

Usa `alt=""` si el icono es decorativo. Si es el único contenido de un botón, etiqueta el botón (por ejemplo, `aria-label="Buscar"`). Para que el icono herede el color del texto mediante `currentColor`, inserta el SVG directamente en el HTML: un SVG cargado con `<img>` no hereda el color de la página.

## Añadir un icono

1. Guarda un SVG en `icons/` con un nombre en minúsculas y separado por guiones, como `arrow-up.svg`.
2. Usa `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"` y extremos y uniones redondeados.
3. Añade su nombre (sin `.svg`) a la lista `icons` de `index.html` y comprueba cómo se ve a los tres tamaños.

Los componentes para React y Astro y el sprite HTML se generarán a partir de estos originales en una fase posterior.
