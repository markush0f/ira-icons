import svgr from 'vite-plugin-svgr';
import { scaleAnimationSvg } from '../shared/animation-speed.ts';

export function reactSvgPlugin() {
  return svgr({ svgrOptions: {
    ref: true,
    plugins: [(source, config, state) => (state.caller?.defaultPlugins ?? [])
      .reduce<string>((svg, plugin) => typeof plugin === 'function' ? plugin(svg, config, state) : svg,
        state.filePath?.endsWith('-animated.svg') ? scaleAnimationSvg(source) : source)],
  } });
}
