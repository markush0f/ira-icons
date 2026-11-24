export const speedProperty = '--ira-icon-speed';
export const isAnimatedIcon = (name: string) => name.endsWith('-animated');
export function normalizeSpeed(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

export function speedStyle(animated: boolean, speed?: number, style?: string) {
  if (!animated) return style;
  return `${style ? `${style};` : ''}${speedProperty}:${normalizeSpeed(speed)}`;
}

// The first time in each animation shorthand is its duration, not its delay.
export function longestAnimationSeconds(css: string) {
  let longest = 0;
  for (const [, value] of css.matchAll(/\banimation(?:-duration)?\s*:\s*([^;}]+)/g)) {
    for (const animation of value.replace(/\([^()]*\)/g, '').split(',')) {
      const time = animation.match(/(?:^|\s)(\d*\.?\d+)(ms|s)(?=\s|$)/);
      if (time) longest = Math.max(longest, Number(time[1]) / (time[2] === 'ms' ? 1000 : 1));
    }
  }
  return longest;
}

// Scale delays as well as durations to preserve the phase of layered motion.
export function scaleAnimationCss(css: string) {
  return css.replace(/\banimation(?:-duration|-delay)?:[^;}]+/g, declaration =>
    declaration.replace(/(?<=[\s:,])(-?(?:\d*\.)?\d+m?s)(?=[\s,;}]|$)/g,
      time => `calc(${time} / var(${speedProperty}, 1))`));
}

export function scaleAnimationSvg(svg: string) {
  return svg.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g,
    (_tag, open, css, close) => open + scaleAnimationCss(css) + close);
}
