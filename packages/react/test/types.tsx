import { createRef } from 'react';
import Icon, { type IconProps } from '@ira-icons/react';
import { iconNames } from '@ira-icons/react/names';

const ref = createRef<SVGSVGElement>();
const props: IconProps = { name: iconNames[0], size: '1em', label: 'Search', strokeWidth: 1.5 };

<Icon {...props} ref={ref} />;
<Icon name="search" className="icon" onClick={(event) => event.currentTarget.focus()} />;
// @ts-expect-error The component requires a name.
<Icon />;
// @ts-expect-error Refs must target SVG elements.
<Icon name="search" ref={createRef<HTMLDivElement>()} />;
