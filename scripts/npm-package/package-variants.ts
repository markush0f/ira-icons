import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface PackageManifest {
  name: string;
  files: string[];
  exports: Record<string, string | Record<string, string>>;
  peerDependencies: Record<string, string>;
  peerDependenciesMeta?: Record<string, unknown>;
  [field: string]: unknown;
}

const frameworkFiles = {
  react: ['react'],
  astro: ['astro', 'icons'],
  vue: ['vue', 'shared'],
  svelte: ['svelte', 'shared'],
};

export async function writePackageVariants(source: string, destination: string, manifest: PackageManifest) {
  const { exports, peerDependencies, peerDependenciesMeta, ...base } = manifest;
  const name = manifest.name;
  const complete = join(destination, 'all');
  await rm(complete, { recursive: true, force: true });
  await mkdir(complete, { recursive: true });
  await Promise.all(manifest.files.map((dir) => cp(join(source, dir), join(complete, dir), { recursive: true })));
  await writeFile(join(complete, 'package.json'), JSON.stringify({ ...manifest, name }, null, 2) + '\n');
  await cp(join(source, 'README.md'), join(complete, 'README.md'));
  await cp(join(source, 'LICENSE'), join(complete, 'LICENSE'));
  await cp(join(source, 'LICENSE.tabler'), join(complete, 'LICENSE.tabler'));

  for (const [framework, files] of Object.entries(frameworkFiles)) {
    const output = join(destination, framework);
    const packageName = `${name}-${framework}`;
    const label = { react: 'React and Next.js', astro: 'Astro', vue: 'Vue', svelte: 'Svelte' }[framework as keyof typeof frameworkFiles];
    const entry = exports[`./${framework}`];
    const individual = exports[`./${framework}/*`];
    await rm(output, { recursive: true, force: true });
    await mkdir(output, { recursive: true });
    await Promise.all(files.map((dir) => cp(join(source, dir), join(output, dir), { recursive: true })));
    await cp(join(source, 'LICENSE'), join(output, 'LICENSE'));
    await cp(join(source, 'LICENSE.tabler'), join(output, 'LICENSE.tabler'));
    await writeFile(join(output, 'package.json'), JSON.stringify({
      ...base,
      name: packageName,
      description: `Ira Icons for ${label}.`,
      files,
      exports: { '.': entry, './*': individual, ...(framework === 'astro' && { './icons/*.svg': exports['./icons/*.svg'] }) },
      peerDependencies: { [framework]: peerDependencies[framework] },
    }, null, 2) + '\n');
    await writeFile(join(output, 'README.md'), `# Ira Icons for ${label}\n\n\`npm install ${packageName}\`\n\nImport an individual icon from \`${packageName}/search-minimalist\`, or use the default \`Icon\` export from \`${packageName}\` with \`name="search-minimalist"\`.\n${framework === 'astro' ? '' : `\nNamed exports such as \`SearchMinimalist\` are also available from \`${packageName}\`.\n`}`);
  }
}
