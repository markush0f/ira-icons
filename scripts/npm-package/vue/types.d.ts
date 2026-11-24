import type { SVGAttributes } from 'vue';

export type IconProps = Omit<SVGAttributes, 'size' | 'color'> & {
  name: string;
  size?: number | string;
  color?: string;
  label?: string;
  speed?: number;
};

export type IndividualIconProps = Omit<IconProps, 'name'>;
