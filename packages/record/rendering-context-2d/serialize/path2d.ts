import { hookMethod } from '@mood/utils';
import { FunctionKeys } from 'utility-types';

export const Path2DMethods: FunctionKeys<Path2D>[] = [
  'addPath',
  'arc',
  'arcTo',
  'bezierCurveTo',
  'closePath',
  'ellipse',
  'lineTo',
  'moveTo',
  'quadraticCurveTo',
  'rect',
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
