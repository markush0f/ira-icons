/**
 * Loads the original SVGs as React components through Vite and SVGR.
 * Like the Astro adapter, this shares the core catalog without code generation.
 */
import { createIconCatalog } from '@ira-icons/core';

const svgModules = import.meta.glob('../../icons/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
});

export const { iconNames, getIcon } = createIconCatalog(svgModules);
