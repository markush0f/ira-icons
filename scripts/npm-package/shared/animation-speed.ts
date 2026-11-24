export const speedProperty = '--ira-icon-speed';
export const iterationProperty = '--ira-icon-iteration';
export const isAnimatedIcon = (name: string) => name.endsWith('-animated');
export function normalizeSpeed(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

/** Animated icons loop constantly unless `constant` is explicitly false. */
export function constantIteration(constant?: boolean) {
  return constant === false ? '1' : 'infinite';
}

export function motionVars(speed?: number, constant?: boolean) {
  return {
    [speedProperty]: String(normalizeSpeed(speed)),
    [iterationProperty]: constantIteration(constant),
  };
}

export function speedStyle(animated: true, speed?: number, style?: string, constant?: boolean): string;
export function speedStyle(animated: boolean, speed?: number, style?: string, constant?: boolean): string | undefined;
export function speedStyle(animated: boolean, speed?: number, style?: string, constant?: boolean) {
  if (!animated) return style;
  const motion = motionVars(speed, constant);
  return `${style ? `${style};` : ''}${speedProperty}:${motion[speedProperty]};${iterationProperty}:${motion[iterationProperty]}`;
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
  return css.replace(/\banimation(?:-duration|-delay|-iteration-count)?:[^;}]+/g, declaration =>
    declaration.replace(/(?<=[\s:,])(-?(?:\d*\.)?\d+m?s)(?=[\s,;}]|$)/g,
      time => `calc(${time} / var(${speedProperty}, 1))`)
      .replace(/\binfinite\b/g, `var(${iterationProperty}, infinite)`));
}

export function scaleAnimationSvg(svg: string) {
  return svg.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g,
    (_tag, open, css, close) => open + scaleAnimationCss(css) + close);
}
