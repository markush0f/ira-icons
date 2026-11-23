import { formatIcon } from './icon-copy.js';
import { mountIconReport } from './icon-report.js';

const $ = s => document.querySelector(s);
const grid = $('#icon-grid'), loader = $('#catalog-loader'), search = $('#icon-search');
const loadButton = $('[data-load-more]'), loadedCount = $('[data-loaded-count]');
const panel = $('#detail-panel'), column = panel.closest('.detail-column'), workspace = column.parentElement;
const dialog = $('#detail-dialog'), compact = matchMedia('(max-width: 48rem)');
const preview = $('#detail-preview'), title = $('#detail-title'), picker = $('[data-color-picker]');
const copy = $('[data-icon-copy]'), status = $('[data-copy-status]');
const options = [...panel.querySelectorAll('[data-suffix]')];
const report = mountIconReport(panel);
const names = grid.dataset.names.split(' '), size = Number(grid.dataset.pageSize);
const categoryValues = grid.dataset.categories.split(' ');
const memberships = new Map(names.map((name,i) => [name, new Set(categoryValues[i].split(','))]));
const categoryPanel = $('#catalog-categories');
const categories = [...categoryPanel.querySelectorAll('[data-category]')].map(input => ({input, id: input.value, label: input.dataset.category}));
const detailCategories = $('[data-detail-categories]');
const categoryCount = $('[data-category-count]');
const clearCategories = $('[data-clear-categories]');
const template = grid.firstElementChild.cloneNode(true);
const colors = new Map(), variants = new Map();
const initialName = title.textContent.trim(), initialSvg = preview.firstElementChild.cloneNode(true);
let shown = 0, matches = names, selected, active, request, revision = 0;

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
  detailCategories.replaceChildren(...categories.filter(({id}) => memberships.get(card.dataset.family).has(id)).map(({label}) => {
    const li = document.createElement('li'); li.textContent = label; return li;
  }));
  detailCategories.hidden = !detailCategories.childElementCount;
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
// Image load/error do not bubble, so catch both for all current and future cards.
for (const type of ['load', 'error']) grid.addEventListener(type, ({target}) => {
  if (target instanceof HTMLImageElement && target.complete) {
    target.closest('[data-family]')?.removeAttribute('data-thumbnail-pending');
  }
}, true);
for (const img of grid.querySelectorAll('.icon-preview img')) {
  img.closest('[data-family]').toggleAttribute('data-thumbnail-pending', !img.complete);
}
function makeCard(name) {
  const card = template.cloneNode(true);
  card.dataset.family = name; card.classList.remove('is-selected'); card.querySelector('button').setAttribute('aria-expanded','false');
  const img = card.querySelector('img');
  img.src = `/icons/${name}.svg`;
  card.toggleAttribute('data-thumbnail-pending', !img.complete);
  card.querySelector('.icon-name').textContent = name;
  return card;
}
function updateLoader() {
  const hasMore = shown < matches.length;
  loader.hidden = matches.length <= size;
  loadButton.hidden = !hasMore;
  loadedCount.textContent = `Showing ${shown} of ${matches.length} icons`;
  // Re-arm after the sentinel moves; on wide screens it may still be within range.
  moreObserver?.unobserve(loader);
  if (hasMore) moreObserver?.observe(loader);
}
function loadMore(manual = false) {
  if (shown >= matches.length) return;
  const cards = matches.slice(shown,shown+size).map(makeCard);
  grid.append(...cards);
  shown += cards.length;
  if (manual) cards[0].querySelector('button').focus();
  updateLoader();
}
const moreObserver = typeof IntersectionObserver === 'function'
  ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && document.activeElement !== loadButton) loadMore();
    }, {rootMargin: '0px 0px 360px 0px'})
  : null;
loadButton.addEventListener('click', () => loadMore(true));
loadButton.addEventListener('blur', updateLoader);

function render(reuse = false) {
  const slice = matches.slice(0,size);
  if (!reuse) grid.replaceChildren(...slice.map(makeCard));
  shown = slice.length;
  column.hidden = !shown; $('#empty-state').hidden = !!shown;
  if (shown) select(grid.firstElementChild); else {request?.abort(); selected = null;}
  const resultText = `${matches.length.toLocaleString()} ${matches.length === 1 ? 'icon' : 'icons'}`;
  $('#icon-count').textContent = resultText;
  updateLoader();
}
const normalize = s => s.trim().toLowerCase().replace(/[\s-]+/g,' ');
const searchIndex = names.map(name => options.map(btn => normalize(name+btn.dataset.suffix+' '+btn.getAttribute('aria-label'))));
function filter() {
  const q = normalize(search.value);
  const checked = categories.filter(({input}) => input.checked);
  matches = names.filter((name,i) => (!checked.length || checked.some(({id}) => memberships.get(name).has(id))) && (!q || searchIndex[i].some(text=>text.includes(q))));
  categoryCount.hidden = !checked.length;
  categoryCount.textContent = `(${checked.length})`;
  clearCategories.hidden = !checked.length;
  render();
}
const params = new URLSearchParams(location.search);
search.value = params.get('q') ?? '';
for (const {input} of categories) input.checked = params.getAll('category').includes(input.value);
categoryPanel.addEventListener('change', event => { if (event.target.matches('[data-category]')) filter(); });
clearCategories.onclick = () => {
  for (const {input} of categories) input.checked = false;
  $('#category-title').focus();
  filter();
};
search.addEventListener('input',filter);
if (search.value || categories.some(({input}) => input.checked)) filter(); else render(true);
categoryPanel.hidden = false;
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
