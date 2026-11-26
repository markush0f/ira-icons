import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const fixtures = new URL('./test-consumers/', import.meta.url);

async function run(command: string, args: string[], cwd: string) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ASTRO_TELEMETRY_DISABLED: '1', NODE_OPTIONS: '--max-old-space-size=6144' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const timer = setTimeout(() => child.kill('SIGKILL'), 300_000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) resolve(output);
      else reject(new Error(`${command} ${args.join(' ')} failed (${code}) in ${cwd}\n${output}`));
    });
  });
}

function checkMarkup(html: string) {
  const svgs = html.match(/<svg\b[^>]*>[\s\S]*?<\/svg>/g) ?? [];
  assert.equal(svgs.length, 3, 'All three package imports must render an SVG');
  assert.match(svgs[0], /aria-label="Individual import"/);
  assert.match(svgs[0], /width="31"/);
  assert.match(svgs[0], /height="31"/);
  assert.match(svgs[0], /color="#663399"/);
  assert.match(svgs[0], /role="img"/);
  assert.doesNotMatch(svgs[0], /aria-hidden/);
  assert.match(svgs[0], /<(?:path|circle|line)\b/);
  assert.match(svgs[1], /aria-label="Named import"/);
  assert.match(svgs[1], /width="29"/);
  assert.match(svgs[1], /--ira-icon-speed:\s*2/);
  assert.match(html, /@keyframes ira-stroke-coffee-0/);
  assert.match(html, /prefers-reduced-motion: no-preference/);
  assert.match(svgs[2], /aria-hidden="true"/);
  assert.match(svgs[2], /width="27"/);
  assert.match(svgs[2], /<path\b/);
}

test('packed packages work in real consumer builds (no source links or SVG loaders)', { timeout: 1_200_000 }, async t => {
  const workspace = await mkdtemp(join(tmpdir(), 'ira-icons-consumers-'));
  t.after(async () => {
    if (process.env.IRA_KEEP_CONSUMERS === '1') console.log(`Consumer projects kept at ${workspace}`);
    else await rm(workspace, { recursive: true, force: true });
  });
  const dependencies: Record<string, string> = {
    react: '19.2.4', 'react-dom': '19.2.4', next: '16.4.6', astro: '7.4.12',
    vue: '3.5.46', svelte: '5.58.1', vite: '7.3.1',
    '@vitejs/plugin-vue': '6.0.4', '@sveltejs/vite-plugin-svelte': '6.2.4',
  };
  // Explicitly install every local tarball so the umbrella package never silently
  // downloads a published adapter instead of testing the code in this checkout.
  for (const variant of ['all', 'react', 'astro', 'vue', 'svelte']) {
    t.diagnostic(`Packing ${variant}`);
    const directory = join(root, 'dist/npm-variants', variant);
    const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
    await run('npm', ['pack', directory, '--pack-destination', workspace, '--ignore-scripts'], workspace);
    const filename = `${manifest.name.replace('@', '').replace('/', '-')}-${manifest.version}.tgz`;
    dependencies[manifest.name] = `file:./${filename}`;
  }
  await writeFile(join(workspace, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies }));
  t.diagnostic('Installing tarballs and consumer dependencies outside the repository');
  await run('npm', ['install', '--no-audit', '--no-fund'], workspace);
  const bin = (name: string) => join(workspace, 'node_modules', '.bin', name);

  for (const framework of ['react', 'vue', 'svelte', 'astro', 'next'] as const) {
    await t.test(framework, { timeout: 300_000 }, async () => {
      const directory = join(workspace, framework);
      await mkdir(directory);
      const adapterName = framework === 'next' ? 'react' : framework;
      const names = ['@ira-icons/iraicons', `@ira-icons/iraicons-${adapterName}`, adapterName,
        ...(adapterName === 'react' ? ['react-dom'] : []),
        ...(framework === 'next' ? ['next'] : framework === 'astro' ? [] : ['vite']),
        ...(framework === 'vue' ? ['@vitejs/plugin-vue'] : framework === 'svelte' ? ['@sveltejs/vite-plugin-svelte'] : [])];
      const appDependencies = Object.fromEntries(names.map(name => [name, dependencies[name].replace('file:./', 'file:../')]));
      await writeFile(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: appDependencies }));
      if (framework === 'astro') {
        await mkdir(join(directory, 'src/pages'), { recursive: true });
        await cp(new URL('astro/index.astro', fixtures), join(directory, 'src/pages/index.astro'));
        await run(bin('astro'), ['build'], directory);
        checkMarkup(await readFile(join(directory, 'dist/index.html'), 'utf8'));
        return;
      }
      if (framework === 'next') {
        await mkdir(join(directory, 'app'));
        await cp(new URL('react/App.jsx', fixtures), join(directory, 'app/page.jsx'));
        await writeFile(join(directory, 'app/layout.jsx'), 'export default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }');
        await writeFile(join(directory, 'next.config.mjs'), 'export default { output: "export", experimental: { cpus: 2 } };');
        await run(bin('next'), ['build', '--webpack'], directory);
        checkMarkup(await readFile(join(directory, 'out/index.html'), 'utf8'));
        return;
      }
      const extension = { react: 'jsx', vue: 'vue', svelte: 'svelte' }[framework];
      await cp(new URL(`${framework}/App.${extension}`, fixtures), join(directory, `App.${extension}`));
      const adapter = {
        react: {
          imports: "import React from 'react'; import { renderToString } from 'react-dom/server';",
          server: 'renderToString(React.createElement(App))',
          client: "import React from 'react'; import { createRoot } from 'react-dom/client'; createRoot(document.getElementById('app')).render(React.createElement(App));",
          plugin: '', plugins: '[]',
        },
        vue: {
          imports: "import { createSSRApp } from 'vue'; import { renderToString } from 'vue/server-renderer';",
          server: 'await renderToString(createSSRApp(App))',
          client: "import { createApp } from 'vue'; createApp(App).mount('#app');",
          plugin: "import vue from '@vitejs/plugin-vue';", plugins: '[vue()]',
        },
        svelte: {
          imports: "import { render } from 'svelte/server';",
          server: 'render(App).body',
          client: "import { mount } from 'svelte'; mount(App, { target: document.getElementById('app') });",
          plugin: "import { svelte } from '@sveltejs/vite-plugin-svelte';", plugins: '[svelte()]',
        },
      }[framework]!;
      await writeFile(join(directory, 'vite.config.js'), `${adapter.plugin}\nexport default { plugins: ${adapter.plugins}, esbuild: { jsx: 'automatic' } };`);
      await writeFile(join(directory, 'entry-client.js'), `import App from './App.${extension}';\n${adapter.client}`);
      await writeFile(join(directory, 'index.html'), '<!doctype html><html lang="en"><head><title>Consumer</title></head><body><div id="app"></div><script type="module" src="/entry-client.js"></script></body></html>');
      await writeFile(join(directory, 'entry-server.js'), `import App from './App.${extension}';\n${adapter.imports}\nconsole.log(${adapter.server});`);
      // Exercise both browser compilation and the actual production SSR output.
      await run(bin('vite'), ['build'], directory);
      await run(bin('vite'), ['build', '--ssr', 'entry-server.js', '--outDir', 'dist-server'], directory);
      checkMarkup(await run(process.execPath, ['dist-server/entry-server.js'], directory));
    });
  }
});
