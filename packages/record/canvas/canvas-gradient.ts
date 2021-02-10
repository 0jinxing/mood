import { Plain } from '../types';
import { hookFunc } from '../utils';

export type CanvasGradientPlain = {
  impl: 'radialGradient' | 'linearGradient';
  restore: {
    canvasId: number;
    create: number[];
    stop: Array<[offset: number, color: string]>;
  };
};

declare global {
  interface CanvasGradient extends Plain<CanvasGradientPlain> {
    $plainData: CanvasGradientPlain;
  }
}

export function extendCanvasGradient() {
  Object.defineProperty(CanvasGradient.prototype, '$plain', {
    value: function () {
      const self: CanvasGradient = this;
      return this.$plainData;
    },
    enumerable: false
  });

  const unsubscribe = hookFunc(
    CanvasGradient.prototype,
    'addColorStop',
    function (_: unknown, offset: number, color: string) {
      const self: CanvasGradient = this;
      if (!self.$plainData) return;
      self.$plainData.restore.stop.push([offset, color]);
    }
  );

  return () => {
    delete CanvasGradient.prototype.$plain;
    unsubscribe();
  };
}
