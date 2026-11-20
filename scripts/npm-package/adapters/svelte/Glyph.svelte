<script lang="ts">
  import { svgProps } from '../shared/icon-props.js';
  import type { IndividualIconProps } from './types.js';

  let {
    icon,
    size = 24,
    color = 'currentColor',
    label,
    ...attrs
  }: IndividualIconProps & {
    icon: { attributes: Record<string, string>; markup: string };
  } = $props();
</script>

<svg {...svgProps(icon, size, color, label, attrs)}>{@html icon.markup}</svg>
