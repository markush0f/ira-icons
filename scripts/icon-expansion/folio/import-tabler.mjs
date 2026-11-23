// Maintenance only: pass the extracted @tabler/icons@3.34.1 npm package directory.
// Normal generation uses the checked-in selection, never the network.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const dir=process.argv[2];
const load=async file=>JSON.parse(await readFile(join(dir,file),'utf8'));
if ((await load('package.json')).version !== '3.34.1') throw Error('Expected Tabler 3.34.1');
const meta=await load('icons.json'), nodes=await load('tabler-nodes-outline.json');
const out=new URL('./tabler.json',import.meta.url);
const previous=await readFile(out,'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return [];throw e});
const ours=new Set(previous.map(row=>row[1]));
const key=n=>n.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join('');
const used=new Set((await readdir(new URL('../../../icons/',import.meta.url))).filter(n=>n.endsWith('.svg')).map(n=>n.slice(0,-4)).filter(n=>!ours.has(n)).map(key));
const choices=[], seen=new Set();
for(const [name,els] of Object.entries(nodes)) {
  let category=meta[name].category||'General';
  if(category==='Sytem')category='System';
  if(['mars','venus'].includes(name))continue; // Exact raster aliases of gender-male/female.
  if(['Brand','Letters','Numbers','Extensions'].includes(category)||!/^[a-z][a-z0-9-]*$/.test(name)||/-(off|filled|animated|minimalist)$/.test(name))continue;
  if(!els.every(([t,a])=>t==='path' && Object.keys(a).length===1 && typeof a.d==='string' && /^[MmLlHhVvZzCcSsQqTtAa\d.eE+,\s-]+$/.test(a.d)))continue;
  const paths=els.map(el=>el[1].d);
  // Prefer base concepts to long runs of status and numeric suffixes.
  const penalty=name.split('-').length + (/-(plus|minus|check|x|up|down|\d+)$/.test(name)?2:0);
  choices.push({name,category,paths,penalty});
}
choices.sort((a,b)=>a.penalty-b.penalty||a.name.localeCompare(b.name,'en'));
const groups=Map.groupBy(choices,c=>c.category), selected=[];
while(selected.length<2048){
  let added=0;
  for(const group of groups.values()){
    while(group.length){
      const {name,category,paths}=group.shift();const shape=JSON.stringify([...paths].sort());
      if(used.has(key(name))||seen.has(shape))continue;
      used.add(key(name));seen.add(shape);selected.push([category,name,paths]);added++;break;
    }
    if(selected.length===2048)break;
  }
  if(!added)throw Error('Not enough eligible drawings');
}
selected.sort((a,b)=>a[1].localeCompare(b[1],'en'));
await writeFile(out,'[\n'+selected.map(e=>JSON.stringify(e)).join(',\n')+'\n]\n');
await writeFile(new URL('TABLER-LICENSE.txt',import.meta.url),await readFile(join(dir,'LICENSE')));
