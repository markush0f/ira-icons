<script lang="ts">
  import { speedStyle } from '../shared/animation-speed.js';
  import { svgProps } from '../shared/icon-props.js';
  import type { IndividualIconProps } from './types.js';

  let {
    icon,
    size = 24,
    color = 'currentColor',
    label,
    speed,
    constant,
    style,
    ...attrs
  }: IndividualIconProps & {
    icon: { attributes: Record<string, string>; markup: string; animated: boolean };
  } = $props();
</script>

<svg {...svgProps(icon, size, color, label, attrs)} style={speedStyle(icon.animated, speed, style, constant)}>{@html icon.markup}</svg>
