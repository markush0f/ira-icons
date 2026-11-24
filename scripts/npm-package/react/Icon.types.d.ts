import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children' | 'dangerouslySetInnerHTML'> {
  name: string;
  size?: number | string;
  label?: string;
  /** Playback multiplier for animated icons. Defaults to 1. */
  speed?: number;
}

declare const Icon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<SVGSVGElement>>;
export { Icon };
export default Icon;
