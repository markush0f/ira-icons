import { readdirSync, readFileSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';
import type { AstroIntegration } from 'astro';

const root = new URL('../', import.meta.url);
const dir = new URL('icons/', root);
const license = 'scripts/icon-expansion/folio/TABLER-LICENSE.txt';
const valid = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.svg$/;
const files = () => readdirSync(dir).filter(name => valid.test(name)).sort();
const moduleId = 'virtual:ira-svg-sources';

// A single server-only catalog instead of compiling 10,000 Astro components.
export const svgCatalog: Plugin = {
  name: 'ira-svg-catalog',
  resolveId(id) { if (id === moduleId) return '\0' + id; },
  load(id) {
    if (id !== '\0' + moduleId) return;
    this.addWatchFile(fileURLToPath(dir));
    const entries = files().map(name => [name.slice(0,-4), readFileSync(new URL(name, dir),'utf8')]);
    return `export default new Map(${JSON.stringify(entries)})`;
  },
  configureServer(server) {
    server.watcher.add(fileURLToPath(dir));
    const base = fileURLToPath(dir).replaceAll('\\','/');
    server.watcher.on('all', (_, path) => {
      if (!path.replaceAll('\\','/').startsWith(base)) return;
      const mod = server.moduleGraph.getModuleById('\0'+moduleId);
      if (mod) server.moduleGraph.invalidateModule(mod);
    });
    server.middlewares.use((req, res, next) => {
      const path = (req.url || '').split('?')[0].slice(1);
      if (path !== license && !(path.startsWith('icons/') && valid.test(path.slice(6)))) return next();
      try {
        const data = readFileSync(new URL(path,root));
        res.setHeader('Content-Type', path.endsWith('.svg')?'image/svg+xml':'text/plain; charset=utf-8');
        res.end(data);
      } catch (err) { if(err instanceof Error && 'code' in err && err.code==='ENOENT')return next(); next(err); }
    });
  },
};

export const publishCatalogAssets: AstroIntegration = {
  name: 'ira-catalog-assets', hooks: {
    'astro:build:done': async ({ dir: out }) => {
      await Promise.all([
        mkdir(new URL('icons/', out), {recursive:true}),
        mkdir(new URL('.', new URL(license, out)), {recursive:true}),
      ]);
      const paths = [license,...files().map(name=>'icons/'+name)];
      for(let i=0;i<paths.length;i+=32) await Promise.all(paths.slice(i,i+32).map(path=>copyFile(new URL(path,root),new URL(path,out))));
    },
  },
};
