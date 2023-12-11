import { hookMethod } from '@mood/utils';
import { FunctionKeys } from 'utility-types';

export const Path2DMethods: FunctionKeys<Path2D>[] = [
  // addPath(path: Path2D [, transform?: DOMMatrix]);
  'addPath',
  // arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: number);
  'arc',
  // arcTo(x1: number, y1: number, x2: number, y2: number, radius: number);
  'arcTo',
  /** bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number); */
  'bezierCurveTo',
  // closePath();
  'closePath',
  // ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: number);
  'ellipse',
  // lineTo(x: number, y: number)
  'lineTo',
  // moveTo(x: number, y: number)
  'moveTo',
  // quadraticCurveTo(cpx: number, cpy: number, x: number, y: number);
  'quadraticCurveTo',
  // rect(x: number, y: number, width: number, height: number);
  'rect',
  // roundRect(x: number, y: number, width: number, height: number, radii: number | number[])
  'roundRect'
];

export type Path2DPatch<K extends FunctionKeys<Path2D>> = [K, ...Parameters<Path2D[K]>];

export const store = new WeakMap<Path2D, Path2DPatch<FunctionKeys<Path2D>>[]>();

export function makePath2DEncodable() {
  const unsubscribes = Path2DMethods.map(key => {
    return hookMethod(Path2D.prototype, key, function (...args: unknown[]) {
      const patch = store.get(this) || [];

      store.set(this, patch);

      switch (key) {
        case 'arc':
        case 'arcTo':
        case 'bezierCurveTo':
        case 'closePath':
        case 'ellipse':
        case 'lineTo':
        case 'moveTo':
        case 'quadraticCurveTo':
        case 'rect':
        case 'roundRect':
          patch.push([key, ...args] as Path2DPatch<FunctionKeys<Path2D>>);
        case 'addPath':
        // TODO
      }
    });
  });

  return () => unsubscribes.forEach(u => u());
}

export function serializePath2D(value: Path2D) {
  return {
    name: 'Path2D',
    patch: store.get(value) || []
  };
}
