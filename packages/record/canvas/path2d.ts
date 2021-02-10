import { Plain } from '../types';
import { hookFunc } from '../utils';

type Path2DMethod =
  | 'addPath'
  | 'arc'
  | 'arcTo'
  | 'bezierCurveTo'
  | 'closePath'
  | 'ellipse'
  | 'lineTo'
  | 'moveTo'
  | 'quadraticCurveTo'
  | 'rect';

type Path2DPlain = {
  impl: 'path2d';
  restore: Array<[key: Path2DMethod, args: unknown[]]>;
};

declare global {
  interface Path2D extends Plain<Path2DPlain> {
    $plainData?: Path2DPlain;
  }
}

const hookKeys: ReadonlyArray<Path2DMethod> = [
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

export function extendPath2D() {
  const prototype = Path2D.prototype;
  Object.defineProperty(prototype, '$plain', {
    value: function () {
      const self: Path2D = this;
      return self.$plainData;
    },
    enumerable: false
  });

  const handlers = hookKeys.map(key =>
    hookFunc(prototype, key, function (_: unknown, ...args: any[]) {
      const self: Path2D = this;

      if (!self.$plainData) self.$plainData = { impl: 'path2d', restore: [] };
      self.$plainData.restore.push([
        key,
        args.map(arg => {
          if (arg instanceof Path2D) return arg.$plain && arg.$plain();
          return arg;
        })
      ]);
    })
  );

  return () => {
    delete Path2D.prototype.$plain;
    handlers.forEach(h => h());
  };
}

export function restorePath2D(plain: Path2DPlain) {
  const result = new Path2D();
  for (const [key, args] of plain.restore) {
    const func: Function = result[key];
    if (key === 'addPath') {
      const [plain] = args;
      args[0] = restorePath2D(plain as Path2DPlain);
    }
    func.apply(result, args);
  }
  return result;
}
