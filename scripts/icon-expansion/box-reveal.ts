import { SVGPathData, type SVGCommand } from 'svg-pathdata';

// Open boxes, folded documents and perspective cubes do not necessarily contain
// a closed, axis-aligned rectangle, but still belong to the same visual family.
const boxNames = /^(?:squares?|rectangles?|box|cube|packages?|container|terminal|browser|window|app-window|layout|calendar|door|file|folder|clipboard|device-(?:desktop|laptop|tablet|mobile|tv))(?:-|$)/;

export function hasBoxGeometry(name: string, body: string) {
  if (boxNames.test(name)) return true;
  for (const [, attrs] of body.matchAll(/<rect\b([^>]*)/g)) {
    const width = Number(attrs.match(/\bwidth="([\d.]+)"/)?.[1]);
    const height = Number(attrs.match(/\bheight="([\d.]+)"/)?.[1]);
    if (width >= 6 && height >= 6) return true;
  }
  for (const [, d] of body.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)) {
    const subpaths: SVGCommand[][] = [];
    for (const command of new SVGPathData(d).toAbs().normalizeHVZ(false).commands) {
      if (command.type === SVGPathData.MOVE_TO) subpaths.push([command]);
      else subpaths.at(-1)?.push(command);
    }
    for (const path of subpaths) {
      const first = path[0];
      if (first.type !== SVGPathData.MOVE_TO) continue;
      const last = path.at(-1)!;
      if (last.type !== SVGPathData.CLOSE_PATH &&
          (!('x' in last && 'y' in last) || Math.hypot(last.x-first.x,last.y-first.y) > .01)) continue;
      let x = first.x, y = first.y, horizontal = 0, vertical = 0, valid = true;
      for (const command of path.slice(1)) {
        if (command.type === SVGPathData.CLOSE_PATH) {
          if (Math.abs(x-first.x) > .01 && Math.abs(y-first.y) > .01) valid = false;
          else if (Math.abs(x-first.x) > .01) horizontal++;
          else if (Math.abs(y-first.y) > .01) vertical++;
        } else if (command.type === SVGPathData.LINE_TO) {
          if (Math.abs(command.y-y) < .01) horizontal++;
          else if (Math.abs(command.x-x) < .01) vertical++;
          else valid = false;
        } else if (command.type !== SVGPathData.ARC || command.rX > 3 || command.rY > 3) {
          valid = false;
        }
        if ('x' in command && 'y' in command) { x = command.x; y = command.y; }
      }
      if (!valid || horizontal < 2 || vertical < 2) continue;
      const bounds = new SVGPathData(path).getBounds();
      if (bounds.maxX-bounds.minX >= 6 && bounds.maxY-bounds.minY >= 6) return true;
    }
  }
  return false;
}
