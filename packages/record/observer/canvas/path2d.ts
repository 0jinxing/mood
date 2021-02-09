import { hookFunc, hookSetter } from 'packages/record/utils';

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

type Path2DPlain = Array<[key: Path2DMethod, args: any[]]>;

declare global {
  interface Path2D {
    $plain?: () => Path2DPlain;
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
    get() {
      return function () {
        const self: Path2D = this;
        return self.$plainData ?? [];
      };
    },
    enumerable: false
  });

  const handlers = hookKeys.map(key =>
    hookFunc(prototype, key, function (_: unknown, ...args: any[]) {
      const self: Path2D = this;

      const data: Path2DPlain = [] || self.$plainData;
      data.push([
        key,
        args.map(arg => {
          if (arg instanceof Path2D) return arg.$plain && arg.$plain();
          return arg;
        })
      ]);
      self.$plainData = data;
    })
  );

  return () => {
    delete Path2D.prototype.$plain;
    handlers.forEach(h => h());
  };
}

export function restorePath2D(plain: Path2DPlain) {
  const result = new Path2D();
  for (const [key, args] of plain) {
    const func: Function = result[key];
    if (key === 'addPath' && args[0]) {
      args[0] = restorePath2D(args[0]);
    }
    func.apply(result, args);
  }
  return result;
}
