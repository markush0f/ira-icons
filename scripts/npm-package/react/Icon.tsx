import React, { forwardRef } from 'react';
import { isAnimatedIcon, normalizeSpeed, speedProperty } from '../shared/animation-speed.ts';
import { getIcon } from './icons.ts';
import type { IconProps } from './Icon.types.d.ts';
export type { IconProps } from './Icon.types.d.ts';

/** Renders an original SVG inline by name, matching the Astro adapter's API. */
const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 24, color = 'currentColor', label, speed, style, ...props },
  ref,
) {
  const Svg = getIcon(name);
  if (!Svg) throw new Error(`Unknown Ira Icons icon: ${String(name)}`);

  const accessibleLabel = typeof label === 'string' ? label.trim() : '';
  const ariaLabel = props['aria-label'] || accessibleLabel;
  const labelled = Boolean(ariaLabel || props['aria-labelledby']);

  return (
    <Svg
      width={size}
      height={size}
      color={color}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable={false}
      {...props}
      style={isAnimatedIcon(name) ? { ...style, [speedProperty]: normalizeSpeed(speed) } as React.CSSProperties : style}
      aria-label={ariaLabel || undefined}
      ref={ref}
    />
  );
});

export { Icon };
export default Icon;
