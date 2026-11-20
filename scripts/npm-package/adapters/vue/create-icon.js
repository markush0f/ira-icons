import { defineComponent, h } from 'vue';
import { svgProps } from '../shared/icon-props.js';

export function createIcon(options, resolveIcon) {
  return defineComponent({
    ...options,
    inheritAttrs: false,
    props: {
      size: { type: [Number, String], default: 24 },
      color: { type: String, default: 'currentColor' },
      label: String,
      ...options.props,
    },
    setup(props, { attrs }) {
      return () => {
        const icon = resolveIcon(props);
        return h('svg', {
          ...svgProps(icon, props.size, props.color, props.label, attrs),
          // Only render the SVG markup shipped with the package.
          innerHTML: icon.markup,
        });
      };
    },
  });
}
