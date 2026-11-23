import { readdirSync, readFileSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const dir = new URL('icons/', root);
const galleries = ['folio.html', 'atlas.html', 'scripts/icon-expansion/folio/TABLER-LICENSE.txt'];
const valid = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.svg$/;
const files = () => readdirSync(dir).filter(name => valid.test(name)).sort();
const moduleId = 'virtual:ira-svg-sources';

// A single server-only catalog instead of compiling 10,000 Astro components.
export const svgCatalog = {
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
      if (!galleries.includes(path) && !(path.startsWith('icons/') && valid.test(path.slice(6)))) return next();
      try {
        const data = readFileSync(new URL(path,root));
        res.setHeader('Content-Type', path.endsWith('.svg')?'image/svg+xml':path.endsWith('.html')?'text/html; charset=utf-8':'text/plain; charset=utf-8');
        res.end(data);
      } catch (err) { if(err.code==='ENOENT')return next(); next(err); }
    });
  },
};

export const publishGalleries = {
  name: 'ira-gallery-assets', hooks: {
    'astro:build:done': async ({ dir: out }) => {
      for (const path of [...galleries, 'icons/']) await mkdir(new URL(path.endsWith('/')?path:path.replace(/[^/]+$/,''),out),{recursive:true});
      const paths = [...galleries,...files().map(name=>'icons/'+name)];
      for(let i=0;i<paths.length;i+=32) await Promise.all(paths.slice(i,i+32).map(path=>copyFile(new URL(path,root),new URL(path,out))));
    },
  },
};
