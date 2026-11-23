// The generated HTML supplies its catalog names before this compiled script.
declare const icons: readonly string[];

const variants = [['Animado', '-animated', 'play'], ['Minimalista', '-minimalist', 'minus'], ['Normal', '', 'square']];
const sizes = [16, 24, 32];
const catalog = document.querySelector<HTMLElement>('#catalog')!;
const cardTemplate = document.querySelector<HTMLTemplateElement>('#icon-card')!;
const sampleTemplate = document.querySelector<HTMLTemplateElement>('#icon-sample')!;

for (const name of icons) {
  const path = `icons/${name}-animated.svg`;
  const card = cardTemplate.content.cloneNode(true) as DocumentFragment;
  const link = card.querySelector('a')!;
  link.href = path;
  link.textContent = name;
  const samples = card.querySelector('.samples')!;

  for (const size of sizes) {
    const sample = sampleTemplate.content.cloneNode(true) as DocumentFragment;
    const image = sample.querySelector('img')!;
    image.width = size;
    image.height = size;
    image.src = path;
    sample.querySelector('figcaption')!.textContent = `${size} px`;
    samples.append(sample);
  }

  const options = document.createElement('div');
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', name);
  for (const [label, suffix, glyph] of variants) {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    const icon = document.createElement('img');
    icon.src = `icons/${glyph}.svg`;
    icon.width = icon.height = 20;
    icon.alt = '';
    button.append(icon);
    button.setAttribute('aria-pressed', String(suffix === '-animated'));
    button.onclick = () => {
      const src = `icons/${name}${suffix}.svg`;
      link.href = src;
      samples.querySelectorAll('img').forEach(image => image.src = src);
      for (const option of options.children) option.setAttribute('aria-pressed', String(option === button));
    };
    options.append(button);
  }
  samples.after(options);
  catalog.append(card);
}
