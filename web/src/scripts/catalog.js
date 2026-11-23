import { formatIcon } from './icon-copy.js';
import { mountIconReport } from './icon-report.js';

const $ = s => document.querySelector(s);
const grid = $('#icon-grid'), pager = $('#catalog-pager'), search = $('#icon-search');
const panel = $('#detail-panel'), column = panel.closest('.detail-column'), workspace = column.parentElement;
const dialog = $('#detail-dialog'), compact = matchMedia('(max-width: 48rem)');
const preview = $('#detail-preview'), title = $('#detail-title'), picker = $('[data-color-picker]');
const copy = $('[data-icon-copy]'), status = $('[data-copy-status]');
const options = [...panel.querySelectorAll('[data-suffix]')];
const report = mountIconReport(panel);
const names = grid.dataset.names.split(' '), size = Number(grid.dataset.pageSize);
const template = grid.firstElementChild.cloneNode(true);
const colors = new Map(), variants = new Map();
const initialName = title.textContent.trim(), initialSvg = preview.firstElementChild.cloneNode(true);
let page = 0, matches = names, selected, active, request, revision = 0;

function expanded() {
  selected?.querySelector('button').setAttribute('aria-expanded', String(!compact.matches || !dialog.showModal || dialog.open));
}
function colorPicker(color) {
  picker.dataset.color = color;
  picker.style.setProperty('--picker-color', color);
  picker.querySelector('[data-color-spectrum]').value = color;
  picker.querySelector('[data-color-hex]').value = color.slice(1);
}
async function select(card, name = variants.get(card.dataset.family) ?? card.dataset.family+'-animated') {
  request?.abort();
  const controller = new AbortController(); request = controller;
  revision++; status.textContent = '';
  selected?.classList.remove('is-selected');
  selected?.querySelector('button').setAttribute('aria-expanded','false');
  selected = card; active = name; variants.set(card.dataset.family, name);
  selected.classList.add('is-selected'); expanded();
  for (const btn of options) btn.setAttribute('aria-pressed', String(card.dataset.family+btn.dataset.suffix === name));
  title.textContent = name; report(name); colorPicker(colors.get(name) ?? '#ad8af3');
  preview.replaceChildren(); preview.setAttribute('aria-busy','true');
  try {
    let svg;
    if (name === initialName) svg = initialSvg.cloneNode(true);
    else {
      const res = await fetch(`/icons/${name}.svg`, {signal: controller.signal});
      if (!res.ok) throw Error('Unavailable SVG');
      svg = new DOMParser().parseFromString(await res.text(), 'image/svg+xml').documentElement;
      if (svg.localName !== 'svg') throw Error('Invalid SVG');
      svg = document.importNode(svg,true);
    }
    if (controller.signal.aborted) return;
    svg.setAttribute('width','96'); svg.setAttribute('height','96');
    svg.setAttribute('aria-hidden','true'); svg.setAttribute('color',colors.get(name) ?? '#ad8af3');
    preview.replaceChildren(svg);
  } catch {
    if (!controller.signal.aborted) status.textContent = 'Could not load icon. Select it to retry.';
  } finally { if (!controller.signal.aborted) preview.removeAttribute('aria-busy'); }
}
function render(reuse = false) {
  const slice = matches.slice(page*size,(page+1)*size);
  if (!reuse) grid.replaceChildren(...slice.map(name => {
    const card = template.cloneNode(true);
    card.dataset.family = name; card.classList.remove('is-selected'); card.querySelector('button').setAttribute('aria-expanded','false');
    card.querySelector('img').src = `/icons/${name}.svg`;
    card.querySelector('.icon-name').textContent = name;
    return card;
  }));
  column.hidden = !slice.length; $('#empty-state').hidden = !!slice.length;
  if (slice.length) select(grid.firstElementChild); else {request?.abort(); selected = null;}
  $('#icon-count').textContent = `${matches.length} ${matches.length===1?'icon':'icons'}`;
  pager.hidden = matches.length <= size;
  pager.querySelector('[data-page]').textContent = `${page+1} / ${Math.ceil(matches.length/size)}`;
  pager.querySelector('[data-prev]').disabled = !page;
  pager.querySelector('[data-next]').disabled = (page+1)*size >= matches.length;
}
const normalize = s => s.trim().toLowerCase().replace(/[\s-]+/g,' ');
const searchIndex = names.map(name => options.map(btn => normalize(name+btn.dataset.suffix+' '+btn.getAttribute('aria-label'))));
function filter() {
  const q = normalize(search.value);
  matches = q ? names.filter((_,i)=>searchIndex[i].some(text=>text.includes(q))) : names;
  page = 0; render();
}
pager.querySelector('[data-prev]').onclick = () => {page--;render();};
pager.querySelector('[data-next]').onclick = () => {page++;render();};
search.value = new URLSearchParams(location.search).get('q') ?? '';
search.addEventListener('input',filter);
if (search.value) filter(); else render(true);
$('#search-field').hidden = false; copy.hidden = false;

grid.addEventListener('click', e => {
  const card = e.target.closest('[data-family]'); if (!card) return;
  select(card);
  if (!compact.matches) return;
  if (dialog.showModal) {dialog.append(column); dialog.showModal(); expanded(); dialog.scrollTop=0;}
  else {panel.focus({preventScroll:true}); panel.scrollIntoView({block:'start'});}
});
if (dialog.showModal) {
  workspace.classList.add('has-detail-dialog');
  dialog.addEventListener('close',()=>{if (!dialog.open) workspace.append(column); expanded();});
  compact.addEventListener('change',()=>{if (!compact.matches && dialog.open) dialog.close(); expanded();});
}
for (const btn of options) btn.onclick = () => {if(selected) select(selected,selected.dataset.family+btn.dataset.suffix);};
panel.addEventListener('icon-color-change', e => {
  if (!selected) return;
  revision++; status.textContent=''; colors.set(active,e.detail.color);
  preview.firstElementChild?.setAttribute('color',e.detail.color);
});
for (const btn of copy.querySelectorAll('[data-copy-format]')) btn.onclick = async () => {
  const svg = preview.firstElementChild; if (!svg) return;
  const version = ++revision, format = btn.dataset.copyFormat;
  try {await navigator.clipboard.writeText(formatIcon(svg,active,format)); if(version===revision) status.textContent=`${format} copied.`;}
  catch {if(version===revision) status.textContent='Couldn’t copy. Check clipboard permissions and try again.';}
};
