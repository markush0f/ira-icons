import type { SVGAttributes } from 'svelte/elements';

export type IconProps = Omit<SVGAttributes<SVGSVGElement>, 'size' | 'color' | 'children'> & {
  name: string;
  size?: number | string;
  color?: string;
  label?: string;
  speed?: number;
};

export type IndividualIconProps = Omit<IconProps, 'name'>;
