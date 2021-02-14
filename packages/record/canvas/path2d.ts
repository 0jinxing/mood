import { getExtraData, setExtraData } from 'packages/snapshot/utils/extra';
import { hookFunc } from '../utils';

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

export type Path2DExtra = {
  k: 'path2d';
  e: [
    create: string | Path2DExtra | undefined,
    patch: Array<[key: typeof PATCH_KEYS[number], args: unknown[]]>
  ];
};

export function extendPath2D() {
  const prototype = Path2D.prototype;

  const handlers = PATCH_KEYS.map(key =>
    hookFunc(prototype, key, function (_: unknown, args: any[]) {
      const self: Path2D = this;

      const extraData = getExtraData<Path2DExtra>(self);

      if (!extraData) return;

      const patch = extraData.e[1];

      patch.push([
        key,
        args.map(arg => {
          if (arg instanceof Path2D) return getExtraData<Path2DExtra>(arg);
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
        path instanceof Path2D ? getExtraData<Path2DExtra>(path) : path;

      const extraData: Path2DExtra = { k: 'path2d', e: [create, []] };

      setExtraData(result, extraData);

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

export function restorePath2D({ e }: Path2DExtra) {
  const [create, patch] = e;

  const result: Path2D = new Path2D(
    !create || typeof create === 'string' ? create : restorePath2D(create)
  );

  for (const [key, args] of patch) {
    const func: Function = result[key];
    if (key === 'addPath') {
      const [path] = args;
      args[0] = restorePath2D(path as Path2DExtra);
    }
    func.apply(result, args);
  }
  return result;
}
