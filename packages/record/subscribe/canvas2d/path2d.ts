import { hookMethod } from 'packages/utils';
import { FunctionKeys } from 'utility-types';

export enum Path2DMethodEmun {
  addPath,
  arc,
  arcTo,
  bezierCurveTo,
  closePath,
  ellipse,
  lineTo,
  moveTo,
  quadraticCurveTo,
  rect
}

export type Path2DPlayload = {
  init?: Path2DPlayload | string;
  steps: Array<[...unknown[]]>;
};

export function hocPath2D() {
  const raw = Path2D;

  class ProxyPath2D extends Path2D {
    __p?: Path2DPlayload | undefined;
    constructor(path?: Path2D | string) {
      super(path);

      this.__p = { steps: [] };
      if (path instanceof Path2D) {
        this.__p.init = path.__p;
      } else {
        this.__p.init = path;
      }
    }
  }

  Object.keys(Path2DMethodEmun).map((key: FunctionKeys<typeof ProxyPath2D.prototype>) =>
    hookMethod(
      ProxyPath2D.prototype,
      key,
      function (...args: Parameters<typeof ProxyPath2D.prototype[typeof key]>) {
        (<Path2D>this).__p?.steps.push([key, ...args]);
      }
    )
  );

  window.Path2D = ProxyPath2D;

  return () => {
    window.Path2D = raw;
  };
}
