import { Plain } from '../../types';

export type CanvasPatternPlain = {
  impl: 'pattern';
  restore: {
    canvasId: number;
    create: number[];
  };
};

declare global {
  interface CanvasPattern extends Plain<CanvasPatternPlain> {
    $plainData: CanvasPatternPlain;
  }
}

export function extendCanvasPattern() {
  Object.defineProperty(CanvasPattern.prototype, '$plain', {
    value: function () {
      const self: CanvasPattern = this;
      return self.$plainData;
    },
    enumerable: false
  });

  return () => {
    delete CanvasPattern.prototype.$plain;
  };
}
