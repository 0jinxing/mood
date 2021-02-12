import { getExtraData } from 'packages/snapshot/utils/extra';
import { hookFunc } from '../utils';

export type CanvasGradientPlain = {
  kind: 'radial' | 'linear';
  extra: {
    canvasId: number;
    create: number[];
    stop: Array<[offset: number, color: string]>;
  };
};

export function extendCanvasGradient() {
  const unsubscribe = hookFunc(
    CanvasGradient.prototype,
    'addColorStop',
    function (_: unknown, offset: number, color: string) {
      const self: CanvasGradient = this;
      const data = getExtraData<CanvasGradientPlain>(self);
      if (data) {
        data.extra.stop.push([offset, color]);
      }
    }
  );

  return () => {
    unsubscribe();
  };
}
