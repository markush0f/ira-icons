/** Resolve required markup explicitly so missing controls fail with a useful message. */
export function requireElement<T extends Element = HTMLElement>(
  selector: string,
  parent: Pick<ParentNode, 'querySelector'> = document,
): T {
  const element = parent.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
}
