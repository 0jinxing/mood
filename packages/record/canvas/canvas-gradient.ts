import { getAddition, Addition } from '@mood/snapshot';
import { hookMethod } from '../utils';

export type CanvasGradientStop = { offset: number; color: string };

export type CanvasRadialGradientAddition = Addition<
  'radial',
  {
    canvasId: number;
    x0: number;
    y0: number;
    r0: number;
    x1: number;
    y1: number;
    r1: number;
    stop: CanvasGradientStop[];
  }
>;

export type CanvasLinearGradientAddition = Addition<
  'linear',
  [
    canvasId: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    stop: CanvasGradientStop[]
  ]
>;

export type CanvasGradientAddition =
  | CanvasRadialGradientAddition
  | CanvasLinearGradientAddition;

export function extendCanvasGradient() {
  const unsubscribe = hookMethod(
    CanvasGradient.prototype,
    'addColorStop',
    function (_: unknown, offset: number, color: string) {
      const self: CanvasGradient = this;

      const extra = getAddition<CanvasGradientAddition>(self)!;
      if (!extra) return;

      const stop = extra.kind === 'linear' ? extra.base[5] : extra.base[7];
      stop.push([offset, color]);
    }
  );

  return () => {
    unsubscribe();
  };
}
