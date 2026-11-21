/**
 * Loads the original SVGs as native Astro components and exposes their shared catalog.
 * Vite discovers the files at build time without a separate code generation step.
 */
import { createIconCatalog } from '../../../scripts/icon-catalog.mjs';

const svgModules = import.meta.glob('../../../icons/*.svg', {
  eager: true,
  import: 'default',
});

export const { iconNames, getIcon } = createIconCatalog(svgModules);
