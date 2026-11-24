import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const web = new URL('web/', root);
const build = spawnSync(process.execPath, [fileURLToPath(new URL('node_modules/astro/bin/astro.mjs', root)), 'build'], {
  cwd: web,
  env: { ...process.env, VERCEL: '1' },
  stdio: 'inherit',
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

// Astro lives in web/, while Vercel builds from the repository root. Publish
// the complete Build Output API bundle, including API functions, at that root.
const source = new URL('.vercel/output/', web);
const output = new URL('.vercel/output/', root);
const config = JSON.parse(await readFile(new URL('config.json', source), 'utf8'));
if (config.version !== 3) throw Error('Missing Vercel Build Output API v3 configuration');
for (const path of ['static/index.html', 'static/installation/index.html', 'static/es/index.html', 'static/icons/arrow-right-animated.svg', 'static/icons/bird-animated.svg', 'functions/']) {
  await stat(new URL(path, source));
}
await mkdir(new URL('.vercel/', root), { recursive: true });
await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
console.log('Published Astro static pages, icon assets, and serverless functions to .vercel/output');
