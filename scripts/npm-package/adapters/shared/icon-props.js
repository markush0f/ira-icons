// Shared defaults for the Vue and Svelte adapters.
export function svgProps(icon, size, color, label, attrs) {
  const ariaLabel = attrs['aria-label'] || (typeof label === 'string' && label.trim()) || undefined;
  const labelled = Boolean(ariaLabel || attrs['aria-labelledby']);

  return {
    ...icon.attributes,
    width: size,
    height: size,
    color,
    role: labelled ? 'img' : undefined,
    'aria-hidden': labelled ? undefined : 'true',
    focusable: 'false',
    ...attrs,
    'aria-label': ariaLabel,
  };
}

export function requireIcon(catalog, name) {
  const icon = catalog[name];
  if (!icon) throw new Error(`Unknown Ira Icons icon: ${String(name)}`);
  return icon;
}
