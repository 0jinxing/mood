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
  extra: Array<[key: Path2DMethod, args: unknown[]]>;
};

export function extendPath2D() {
  const prototype = Path2D.prototype;

  const handlers = METHOD_KEYS.map(key =>
    hookFunc(prototype, key, function (_: unknown, ...args: any[]) {
      const self: Path2D = this;

      const extraData = getExtraData<Path2DPlain>(self) || {
        kind: 'path2d',
        extra: []
      };

      extraData.extra.push([
        key,
        args.map(arg => {
          if (arg instanceof Path2D) return getExtraData<Path2DPlain>(arg);
          return arg;
        })
      ]);

      setExtraData(self, extraData);
    })
  );

  return () => {
    handlers.forEach(h => h());
  };
}

export function restorePath2D(plain: Path2DPlain) {
  const result = new Path2D();
  for (const [key, args] of plain.extra) {
    const func: Function = result[key];
    if (key === 'addPath') {
      const [plain] = args;
      args[0] = restorePath2D(plain as Path2DPlain);
    }
    func.apply(result, args);
  }
  return result;
}
