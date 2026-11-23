import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {SVGPathData} from 'svg-pathdata';
import {folioIcons} from './families.mjs';

const dir=new URL('../../../icons/',import.meta.url), ids=new Set(), hashes=new Map(), issues=[];
for(const file of await readdir(dir)){
  if(!file.endsWith('.svg'))continue;
  const id=file.slice(0,-4).replace(/-([a-z0-9])/g,(_,c)=>c.toUpperCase());
  assert(!ids.has(id),`Component name collision: ${file}`);ids.add(id);
}
let checks=0;
async function verify({name}){
  for(const suffix of ['', '-minimalist','-animated']){
    const file=name+suffix+'.svg', source=await readFile(new URL(file,dir),'utf8');
    for(const [,d] of source.matchAll(/<path d="([^"]+)"/g))new SVGPathData(d);
    for(const size of [16,24,48]){
      const alpha=await sharp(Buffer.from(source),{density:size*3}).ensureAlpha().extractChannel('alpha').raw().toBuffer();
      assert.equal(alpha.length,size**2,file);
      const ink=alpha.reduce((a,b)=>a+b,0)/255;
      if(ink<1||ink>size**2*.89)issues.push(`${file} unexpected ink ${ink} at ${size}`);
      if(size===48){
        for(let j=0;j<size;j++)if(Math.max(alpha[j],alpha.at(-1-j),alpha[j*size],alpha[(j+1)*size-1])>=20){issues.push(`${file}: touches edge`);break}
        if(!suffix){const hash=createHash('sha256').update(alpha).digest('hex');if(hashes.has(hash))issues.push(`${file}: duplicates ${hashes.get(hash)}`);hashes.set(hash,name)}
      }
      checks++;
    }
  }
}
for(let i=0;i<folioIcons.length;i+=8)await Promise.all(folioIcons.slice(i,i+8).map(verify));
if(issues.length)throw Error(issues.join('\n'));
console.log(`${hashes.size} distinct Folio originals; ${checks} raster checks passed.`);
