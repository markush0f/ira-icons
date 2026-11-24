import { defineComponent, h, type ComponentObjectPropsOptions } from 'vue';
import { svgProps, type SerializedIcon } from '../shared/icon-props.ts';

import { normalizeSpeed, speedProperty } from '../shared/animation-speed.ts';

interface GlyphProps { name?: string; size: number | string; color: string; label?: string; speed?: number }

export function createIcon(options: { name: string; props?: ComponentObjectPropsOptions }, resolveIcon: (props: GlyphProps) => SerializedIcon) {
  return defineComponent({
    ...options,
    inheritAttrs: false,
    props: {
      size: { type: [Number, String], default: 24 },
      color: { type: String, default: 'currentColor' },
      label: String,
      speed: Number,
      ...options.props,
    },
    setup(props, { attrs }) {
      return () => {
        const glyphProps = props as unknown as GlyphProps;
        const icon = resolveIcon(glyphProps);
        return h('svg', {
          ...svgProps(icon, glyphProps.size, glyphProps.color, glyphProps.label, attrs),
          ...(icon.animated && { style: [attrs.style, { [speedProperty]: normalizeSpeed(glyphProps.speed) }] }),
          // Only render the SVG markup shipped with the package.
          innerHTML: icon.markup,
        });
      };
    },
  });
}
