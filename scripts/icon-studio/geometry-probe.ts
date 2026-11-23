// This document is assembled from the tool's generated SVGs, not uploaded SVG.
(() => {
  const output = document.querySelector<HTMLOutputElement>('#geometry-result')!;
  try {
    function checkBox(svg: SVGSVGElement, label: string) {
      const { x, y, width, height } = svg.getBBox();
      if (![x, y, width, height].every(Number.isFinite) || (width === 0 && height === 0)) {
        throw new Error(label + ': empty geometry');
      }
      // A 2 px round stroke extends 1 unit beyond the geometry.
      if (x < 0.99 || y < 0.99 || x + width > 23.01 || y + height > 23.01) {
        const bounds = [x, y, x + width, y + height].map(value => value.toFixed(2)).join(', ');
        throw new Error(label + ': possible clipping (geometry bounds ' + bounds + ')');
      }
    }

    for (const section of document.querySelectorAll<HTMLElement>('section[data-file]')) {
      const svg = section.querySelector('svg')!;
      const file = section.dataset.file!;
      for (const [index, path] of [...svg.querySelectorAll('path')].entries()) {
        if (!path.getTotalLength()) throw new Error(file + ': path ' + (index + 1) + ' has no length');
      }
      checkBox(svg, file);
      const animations = svg.getAnimations({ subtree: true });
      if (file.endsWith('-animated.svg') && animations.length === 0) {
        throw new Error(file + ': no active animation; use a browser with motion enabled');
      }
      for (const animation of animations) animation.pause();
      for (let step = 0; animations.length && step < 24; step++) {
        for (const animation of animations) {
          const timing = animation.effect?.getTiming();
          if (!timing || typeof timing.duration !== 'number') throw new Error(file + ': invalid animation duration');
          animation.currentTime = (timing.delay ?? 0) + timing.duration * step / 24;
        }
        checkBox(svg, file + ' at ' + Math.round(step / 24 * 100) + '%');
      }
    }
    output.textContent = 'pass';
  } catch (error) {
    output.textContent = error instanceof Error ? error.message : String(error);
  }
})();
