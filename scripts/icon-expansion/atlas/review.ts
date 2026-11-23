import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {SVGPathData} from 'svg-pathdata';
import {placeIcons} from './places.ts';
import {tabletopIcons} from './tabletop.ts';
import {panelIcons} from './panels.ts';

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
        for(let j=0;j<size;j++) assert(Math.max(pixels[j],pixels.at(-1-j)!,pixels[j*size],pixels[j*size+size-1])<16,`${file}: clipped stroke`);
        if(!suffix){
          const key=createHash('sha256').update(pixels).digest('hex');
          assert(!hashes.has(key),`${file}: visually identical original`); hashes.add(key);
        }
      }
    }
  }
}
console.log(`Passed: ${families.length} distinct originals; ${families.length*9} raster checks.`);
