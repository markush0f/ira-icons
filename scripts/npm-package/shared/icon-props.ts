export interface SerializedIcon {
  attributes: Record<string, string>;
  markup: string;
  animated: boolean;
}
export type SvgAttributes = Record<string, unknown>;

// Shared defaults for the Vue and Svelte adapters.
export function svgProps(icon: SerializedIcon, size: number | string, color: string, label: string | undefined, attrs: SvgAttributes): SvgAttributes {
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

export function requireIcon(catalog: Record<string, SerializedIcon>, name: string): SerializedIcon {
  const icon = catalog[name];
  if (!icon) throw new Error(`Unknown Ira Icons icon: ${String(name)}`);
  return icon;
}
