/**
 * Loads the original SVGs as React components through Vite and SVGR.
 * Like the Astro adapter, this shares the core catalog without code generation.
 */
import { createIconCatalog } from '../../icon-catalog.ts';

import type { ComponentType, SVGProps } from 'react';

const svgModules = import.meta.glob<ComponentType<SVGProps<SVGSVGElement>>>('../../../icons/*.svg', {
  eager: true,
  query: '?react',
  import: 'default',
});

export const { iconNames, getIcon } = createIconCatalog(svgModules);
