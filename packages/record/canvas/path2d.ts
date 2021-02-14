import { getExtraData, setExtraData } from 'packages/snapshot/utils/extra';
import { hookFunc } from '../utils';

const METHOD_KEYS = <const>[
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

type Path2DMethod = typeof METHOD_KEYS[number];

export type Path2DPlain = {
  kind: 'path2d';
  extra: {
    create: Array<string | Path2DPlain | undefined>;
    patch: Array<[key: Path2DMethod, args: unknown[]]>;
  };
};

export function extendPath2D() {
  const prototype = Path2D.prototype;

  const handlers = METHOD_KEYS.map(key =>
    hookFunc(prototype, key, function (_: unknown, args: any[]) {
      const self: Path2D = this;

      const extraData = getExtraData<Path2DPlain>(self);

      if (!extraData) return;

      extraData.extra.patch.push([
        key,
        args.map(arg => {
          if (arg instanceof Path2D) return getExtraData<Path2DPlain>(arg);
          return arg;
        })
      ]);
    })
  );

  const origin = Path2D;

  const revocable = Proxy.revocable(Path2D, {
    construct(target, [path]: [string | Path2D], newTarget) {
      const result = Reflect.construct(target, [path], newTarget);
      const create = [
        path instanceof Path2D ? getExtraData<Path2DPlain>(path) : path
      ];
      const extraData: Path2DPlain = {
        kind: 'path2d',
        extra: { create, patch: [] }
      };
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

export function restorePath2D(plain: Path2DPlain) {
  const result = new Path2D();
  for (const [key, args] of plain.extra.patch) {
    const func: Function = result[key];
    if (key === 'addPath') {
      const [plain] = args;
      args[0] = restorePath2D(plain as Path2DPlain);
    }
    func.apply(result, args);
  }
  return result;
}
