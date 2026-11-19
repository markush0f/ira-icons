import React, { forwardRef } from 'react';
import { getIcon } from './icons.mjs';

/** Renders an original SVG inline by name, matching the Astro adapter's API. */
const Icon = forwardRef(function Icon(
  { name, size = 24, color = 'currentColor', label, ...props },
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
      aria-label={ariaLabel || undefined}
      ref={ref}
    />
  );
});

export { Icon };
export default Icon;
