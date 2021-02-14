import { getExtraData } from 'packages/snapshot/utils/extra';
import { hookFunc } from '../utils';

export type CanvasGradientStop = [offset: number, color: string];

export type CanvasRadialGradientExtra = {
  k: 'radial';
  e: [
    canvasId: number,
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
    stop: CanvasGradientStop[]
  ];
};

export type CanvasLinearGradientExtra = {
  k: 'linear';
  e: [
    canvasId: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    stop: CanvasGradientStop[]
  ];
};

export type CanvasGradientExtra =
  | CanvasRadialGradientExtra
  | CanvasLinearGradientExtra;

export function extendCanvasGradient() {
  const unsubscribe = hookFunc(
    CanvasGradient.prototype,
    'addColorStop',
    function (_: unknown, offset: number, color: string) {
      const self: CanvasGradient = this;
      const data = getExtraData<CanvasGradientExtra>(self);
      if (!data) return;

      const stop = data.k === 'linear' ? data.e[5] : data.e[7];
      stop.push([offset, color]);
    }
  );

  return () => {
    unsubscribe();
  };
}
