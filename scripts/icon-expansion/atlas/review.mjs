import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {SVGPathData} from 'svg-pathdata';
import {placeIcons} from './places.mjs';
import {tabletopIcons} from './tabletop.mjs';
import {panelIcons} from './panels.mjs';

const families=[...placeIcons,...panelIcons,...tabletopIcons];
const root=new URL('../../../',import.meta.url);
const hashes=new Set();
for(const {name} of families){
  for(const suffix of ['', '-minimalist','-animated']){
    const file=name+suffix+'.svg';
    const source=await readFile(new URL('icons/'+file,root),'utf8');
    for(const match of source.matchAll(/<path d="([^"]+)"/g)) new SVGPathData(match[1]);
    for(const size of [16,24,48]){
      const pixels=await sharp(Buffer.from(source),{density:72*size/24}).ensureAlpha().extractChannel('alpha').raw().toBuffer();
      assert.equal(pixels.length,size*size,file);
      const ink=pixels.reduce((sum,value)=>sum+value/255,0)/pixels.length;
      assert(ink>.025 && ink<.7,`${file}: unexpected ink coverage at ${size}px (${ink})`);
      if(size===48){
        for(let j=0;j<size;j++) assert(Math.max(pixels[j],pixels.at(-1-j),pixels[j*size],pixels[j*size+size-1])<16,`${file}: clipped stroke`);
        if(!suffix){
          const key=createHash('sha256').update(pixels).digest('hex');
          assert(!hashes.has(key),`${file}: visually identical original`); hashes.add(key);
        }
      }
    }
  }
}
console.log(`Passed: ${families.length} distinct originals; ${families.length*9} raster checks.`);
if(process.argv.includes('--gallery')){
 const sections=[['Señalización',placeIcons],['Dispositivos y controles',panelIcons],['Calendario, juegos y teclas',tabletopIcons]];
 const html=`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atlas · Ira Icons</title><style>body{font:16px system-ui;margin:auto;max-width:1200px;padding:2rem;background:#faf9f5;color:#182925}section{display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:6px}a{display:grid;justify-items:center;align-content:center;gap:9px;background:white;color:inherit;text-decoration:none;border:1px solid #ddd;border-radius:10px;padding:12px 4px;font:12px monospace}a:hover,a:focus{border-color:#19705b}img{width:36px;height:36px}select{font:inherit}</style><h1>Atlas · ${families.length} iconos nuevos</h1><label>Estilo <select><option value="">Original</option><option value="-minimalist">Minimalista</option><option value="-animated">Animado</option></select></label>${sections.map(([title,icons])=>`<h2>${title}</h2><section>${icons.map(({name})=>`<a href="icons/${name}.svg" data-name="${name}"><img loading="lazy" alt="" src="icons/${name}.svg">${name}</a>`).join('')}</section>`).join('')}<script>document.querySelector('select').onchange=e=>document.querySelectorAll('a').forEach(a=>{a.href=a.firstChild.src='icons/'+a.dataset.name+e.target.value+'.svg'})</script></html>`;
 await writeFile(new URL('atlas.html',root),html);
}
