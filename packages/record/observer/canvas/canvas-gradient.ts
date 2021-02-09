import { hookFunc } from 'packages/record/utils';

export type CanvasGradientPlain = {
  canvasId: number;
  type: 'radial' | 'linear';
  create: number[];
  stop: Array<[offset: number, color: string]>;
};

declare global {
  interface CanvasGradient {
    $plain?: () => CanvasGradientPlain;
    $plainData?: CanvasGradientPlain;
  }
}

export function extendCanvasGradient() {
  Object.defineProperty(CanvasGradient.prototype, '$plain', {
    get() {
      return function () {
        const self: CanvasGradient = this;
        return this.$plainData;
      };
    }
  });

  const handler = hookFunc(
    CanvasGradient.prototype,
    'addColorStop',
    function (_: unknown, offset: number, color: string) {
      const self: CanvasGradient = this;
      if (!self.$plainData) return;
      self.$plainData.stop.push([offset, color]);
    }
  );

  return () => {
    delete CanvasGradient.prototype.$plain;
    handler();
  };
}
