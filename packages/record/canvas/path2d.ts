import { Addition, getAddition, setAddition } from '@mood/snapshot';
import { hookMethod } from '../utils';

const PATCH_KEYS = <const>[
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

export type Path2DAddition = Addition<
  'path2d',
  [
    create: string | Path2DAddition | undefined,
    patch: Array<[key: typeof PATCH_KEYS[number], args: unknown[]]>
  ]
>;

export function extendPath2D() {
  const prototype = Path2D.prototype;

  const handlers = PATCH_KEYS.map(key =>
    hookMethod(prototype, key, function (_: unknown, args: any[]) {
      const self: Path2D = this;

      const extra = getAddition<Path2DAddition>(self);

      if (!extra) return;

      const patch = extra.base[1];

      patch.push([
        key,
        args.map(arg => {
          if (arg instanceof Path2D) return getAddition<Path2DAddition>(arg);
          return arg;
        })
      ]);
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
