import { Addition, getAddition, setAddition } from '@mood/snapshot';
import { MethodKeys, ValueOf } from '../types';
import { hookMethod } from '../utils';

const PATCH_KEYS: ReadonlyArray<MethodKeys<Path2D>> = [
  'addPath',
  'arc',
  'arcTo',
  'bezierCurveTo',
  'closePath',
  'ellipse',
  'lineTo',
  'moveTo',
  'quadraticCurveTo',
  'rect'
];

type Patch<T extends object> = ValueOf<
  { [K in MethodKeys<T>]: { key: K; args: Parameters<T[K]> } }
>;

export type Path2DAddition = Addition<
  'path2d',
  {
    create: string | Path2DAddition | undefined;
    patch: Patch<Path2D>[];
  }
>;

export function extendPath2D() {
  const prototype = Path2D.prototype;

  const handlers = PATCH_KEYS.map(key =>
    hookMethod(prototype, key, function (_, args) {
      const self: Path2D = this;

      const extra = getAddition<Path2DAddition>(self);

      if (!extra) return;

      const patch = extra.base.patch;

      if (key === 'addPath') {
        args.map();
      }

      patch.push({ key, args });
    })
  );

  const origin = Path2D;

  const revocable = Proxy.revocable(Path2D, {
    construct(target, [path]: [string | Path2D], newTarget) {
      const result = Reflect.construct(target, [path], newTarget);

      const create =
        path instanceof Path2D ? getAddition<Path2DAddition>(path) : path;

      const extra: Path2DAddition = { kind: 'path2d', base: [create, []] };

      setAddition(result, extra);

      return result;
    }
  });

  window.Path2D = revocable.proxy;

  return () => {
    revocable.revoke();
    window.Path2D = origin;

    handlers.forEach(h => h());
  };
}
