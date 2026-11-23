/**
 * Turns an adapter's SVG imports into a validated, sorted catalog with name lookup.
 * Core does not depend on a framework or bundler.
 */
export function createIconCatalog<T>(svgModules: Record<string, T>) {
  const icons = new Map<string, T>();

  for (const path of Object.keys(svgModules).sort()) {
    const filename = path.split('/').pop()!;
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.svg$/.test(filename)) {
      throw new Error(`Invalid icon filename "${filename}". Use lowercase letters, digits, and hyphens.`);
    }

    const name = filename.slice(0, -4);
    if (icons.has(name)) throw new Error(`Duplicate icon name: ${name}`);
    icons.set(name, svgModules[path]);
  }

  return {
    iconNames: Object.freeze([...icons.keys()].sort()),
    getIcon: (name: string) => icons.get(name),
  };
}
