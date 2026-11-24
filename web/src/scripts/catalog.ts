import { isAnimatedIcon, longestAnimationSeconds, scaleAnimationCss, speedProperty } from '../../../scripts/npm-package/shared/animation-speed.ts';
import { formatIcon, type CodeFormat } from './icon-copy.ts';
import { mountIconReport } from './icon-report.ts';
import { requireElement as $ } from './dom.ts';

const grid = $('#icon-grid'), loader = $('#catalog-loader'), search = $<HTMLInputElement>('#icon-search');
const loadButton = $<HTMLButtonElement>('[data-load-more]'), loadedCount = $('[data-loaded-count]');
const panel = $('#detail-panel'), column = panel.closest<HTMLElement>('.detail-column')!, workspace = column.parentElement!;
const dialog = $<HTMLDialogElement>('#detail-dialog'), compact = matchMedia('(max-width: 48rem)');
const preview = $('#detail-preview'), title = $('#detail-title'), picker = $('[data-color-picker]');
const speedPicker = $('[data-speed-picker]'), speedInput = $<HTMLInputElement>('[data-icon-speed]', speedPicker);
const speeds = new Map<string, number>();
const seconds = new Intl.NumberFormat('en', { maximumFractionDigits: 3 });
const loopDuration = $('[data-loop-duration]', speedPicker);
let baseLoopDuration = 0;
function showLoopDuration() {
  const duration = speedInput.disabled ? 0 : speedInput.valueAsNumber;
  loopDuration.textContent = duration ? `${seconds.format(duration)} s` : '—';
  if (duration) speedInput.setAttribute('aria-valuetext', `${seconds.format(duration)} seconds`);
  else speedInput.removeAttribute('aria-valuetext');
}
const copy = $('[data-icon-copy]'), status = $('[data-copy-status]');
const options = [...panel.querySelectorAll<HTMLButtonElement>('[data-suffix]')];
const report = mountIconReport(panel);
const names = grid.dataset.names!.split(' '), size = Number(grid.dataset.pageSize);
const categoryValues = grid.dataset.categories!.split(' ');
const memberships = new Map(names.map((name,i) => [name, new Set(categoryValues[i].split(','))]));
const categoryPanel = $('#catalog-categories');
const categories = [...categoryPanel.querySelectorAll<HTMLInputElement>('[data-category]')].map(input => ({input, id: input.value, label: input.dataset.category!}));
const detailCategories = $('[data-detail-categories]');
const categoryCount = $('[data-category-count]');
const clearCategories = $('[data-clear-categories]');
const template = grid.firstElementChild!.cloneNode(true) as HTMLLIElement;
const colors = new Map<string, string>(), variants = new Map<string, string>();
const initialName = title.textContent.trim(), initialSvg = preview.firstElementChild!.cloneNode(true) as SVGSVGElement;
let shown = 0, matches = names, revision = 0;
let selected: HTMLLIElement | null = null;
let active = '';
let request: AbortController | undefined;
let statusTimer: number | undefined;

function showStatus(message = '', duration?: number) {
  window.clearTimeout(statusTimer);
  status.textContent = message;
  statusTimer = duration === undefined ? undefined : window.setTimeout(() => showStatus(), duration);
}

function expanded() {
  selected?.querySelector('button')!.setAttribute('aria-expanded', String(!compact.matches || !dialog.showModal || dialog.open));
}
function colorPicker(color: string) {
  picker.dataset.color = color;
  picker.style.setProperty('--picker-color', color);
  $<HTMLInputElement>('[data-color-spectrum]', picker).value = color;
  $<HTMLInputElement>('[data-color-hex]', picker).value = color.slice(1);
}
async function select(card: HTMLLIElement, name = variants.get(card.dataset.family!) ?? card.dataset.family+'-animated') {
  request?.abort();
  const controller = new AbortController(); request = controller;
  revision++; showStatus();
  selected?.classList.remove('is-selected');
  selected?.querySelector('button')!.setAttribute('aria-expanded','false');
  selected = card; active = name; variants.set(card.dataset.family!, name);
  selected.classList.add('is-selected'); expanded();
  for (const btn of options) btn.setAttribute('aria-pressed', String(card.dataset.family!+btn.dataset.suffix! === name));
  title.textContent = name; report(name); colorPicker(colors.get(name) ?? '#ad8af3');
  speedPicker.hidden = !isAnimatedIcon(name);
  speedInput.disabled = true;
  baseLoopDuration = 0;
  showLoopDuration();
  detailCategories.replaceChildren(...categories.filter(({id}) => memberships.get(card.dataset.family!)!.has(id)).map(({label}) => {
    const li = document.createElement('li'); li.textContent = label; return li;
  }));
  detailCategories.hidden = !detailCategories.childElementCount;
  preview.replaceChildren(); preview.setAttribute('aria-busy','true');
  try {
    let svg: SVGSVGElement;
    if (name === initialName) svg = initialSvg.cloneNode(true) as SVGSVGElement;
    else {
      const res = await fetch(`/icons/${name}.svg`, {signal: controller.signal});
      if (!res.ok) throw Error('Unavailable SVG');
      const root = new DOMParser().parseFromString(await res.text(), 'image/svg+xml').documentElement;
      if (root.localName !== 'svg') throw Error('Invalid SVG');
      svg = document.importNode(root, true) as unknown as SVGSVGElement;
    }
    if (controller.signal.aborted) return;
    svg.setAttribute('width','144'); svg.setAttribute('height','144');
    svg.setAttribute('aria-hidden','true'); svg.setAttribute('color',colors.get(name) ?? '#ad8af3');
    if (isAnimatedIcon(name)) {
      let duration = 0;
      for (const style of svg.querySelectorAll('style')) {
        const css = style.textContent ?? '';
        duration = Math.max(duration, longestAnimationSeconds(css));
        style.textContent = scaleAnimationCss(css);
      }
      baseLoopDuration = duration;
      if (duration > 0) {
        speedInput.min = (Math.ceil(duration * 500) / 1000).toFixed(3);
        speedInput.max = (duration * 2).toFixed(3);
        speedInput.value = (duration / (speeds.get(name) ?? 1)).toFixed(3);
        speedInput.disabled = false;
      }
      showLoopDuration();
      svg.style.setProperty(speedProperty, String(speeds.get(name) ?? 1));
    }
    preview.replaceChildren(svg);
  } catch {
    if (!controller.signal.aborted) showStatus('Could not load icon. Select it to retry.');
  } finally { if (!controller.signal.aborted) preview.removeAttribute('aria-busy'); }
}
// Image load/error do not bubble, so catch both for all current and future cards.
for (const type of ['load', 'error']) grid.addEventListener(type, ({target}: Event) => {
  if (target instanceof HTMLImageElement && target.complete) {
    target.closest('[data-family]')?.removeAttribute('data-thumbnail-pending');
  }
}, true);
for (const img of grid.querySelectorAll<HTMLImageElement>('.icon-preview img')) {
  img.closest('[data-family]')!.toggleAttribute('data-thumbnail-pending', !img.complete);
}
function makeCard(name: string) {
  const card = template.cloneNode(true) as HTMLLIElement;
  card.dataset.family = name; card.classList.remove('is-selected'); card.querySelector('button')!.setAttribute('aria-expanded','false');
  const img = card.querySelector('img')!;
  img.src = `/icons/${name}.svg`;
  card.toggleAttribute('data-thumbnail-pending', !img.complete);
  card.querySelector('.icon-name')!.textContent = name;
  return card;
}
function updateLoader() {
  const hasMore = shown < matches.length;
  loader.hidden = matches.length <= size;
  loadButton.hidden = !hasMore;
  loadedCount.textContent = `Showing ${shown} of ${matches.length} icons`;
  moreObserver?.unobserve(loader);
  if (hasMore) moreObserver?.observe(loader);
}
function loadMore(manual = false) {
  if (shown >= matches.length) return;
  const cards = matches.slice(shown,shown+size).map(makeCard);
  grid.append(...cards);
  shown += cards.length;
  if (manual) cards[0].querySelector('button')!.focus();
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
  if (shown) select(grid.firstElementChild as HTMLLIElement); else {request?.abort(); selected = null;}
  const resultText = `${matches.length.toLocaleString()} ${matches.length === 1 ? 'icon' : 'icons'}`;
  $('#icon-count').textContent = resultText;
  updateLoader();
}
const normalize = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g,' ');
const searchIndex = names.map(name => options.map(btn => normalize(name+btn.dataset.suffix+' '+btn.getAttribute('aria-label'))));
function filter() {
  const q = normalize(search.value);
  const checked = categories.filter(({input}) => input.checked);
  matches = names.filter((name,i) => (!checked.length || checked.some(({id}) => memberships.get(name)!.has(id))) && (!q || searchIndex[i].some(text=>text.includes(q))));
  categoryCount.hidden = !checked.length;
  categoryCount.textContent = `(${checked.length})`;
  clearCategories.hidden = !checked.length;
  render();
}
const params = new URLSearchParams(location.search);
search.value = params.get('q') ?? '';
for (const {input} of categories) input.checked = params.getAll('category').includes(input.value);
categoryPanel.addEventListener('change', event => { if (event.target instanceof Element && event.target.matches('[data-category]')) filter(); });
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
  const card = e.target instanceof Element ? e.target.closest<HTMLLIElement>('[data-family]') : null;
  if (!card) return;
  select(card);
  if (!compact.matches) return;
  if (dialog.showModal) {dialog.append(column); dialog.showModal(); expanded(); dialog.scrollTop=0;}
  else {panel.focus({preventScroll:true}); panel.scrollIntoView({block:'start'});}
});
if (typeof HTMLDialogElement !== 'undefined' && 'showModal' in HTMLDialogElement.prototype) {
  workspace.classList.add('has-detail-dialog');
  dialog.addEventListener('close',()=>{if (!dialog.open) workspace.append(column); expanded();});
  compact.addEventListener('change',()=>{if (!compact.matches && dialog.open) dialog.close(); expanded();});
}
for (const btn of options) btn.onclick = () => {if(selected) select(selected,selected.dataset.family!+btn.dataset.suffix!);};
panel.addEventListener('icon-color-change', e => {
  if (!selected) return;
  const { color } = (e as CustomEvent<{ color: string }>).detail;
  revision++; showStatus(); colors.set(active,color);
  preview.firstElementChild?.setAttribute('color',color);
});
speedInput.addEventListener('input', () => {
  if (speedInput.disabled || !baseLoopDuration) return;
  const speed = Number((baseLoopDuration / speedInput.valueAsNumber).toFixed(6));
  revision++; showStatus(); speeds.set(active, speed);
  showLoopDuration();
  preview.querySelector('svg')?.style.setProperty(speedProperty, String(speed));
});
for (const btn of copy.querySelectorAll<HTMLButtonElement>('[data-copy-format]')) btn.onclick = async () => {
  const svg = preview.querySelector('svg');
  if (!svg) return;
  const version = ++revision, format = btn.dataset.copyFormat as CodeFormat;
  try {
    await navigator.clipboard.writeText(formatIcon(svg, active, format, speeds.get(active)));
    if (version === revision) showStatus(`Copied as ${format}`, 4_000);
  } catch {
    if (version === revision) showStatus('Couldn’t copy. Check clipboard permissions.', 4_000);
  }
};
