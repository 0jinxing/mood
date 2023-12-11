import { hookMethod } from '@mood/utils';

export function makeCanvasPatternEncodable() {
  hookMethod(CanvasRenderingContext2D.prototype, 'createPattern', function (image, repetition) {
    return {
      name: 'CanvasPattern',
      args: [image, repetition]
    };
  });
}
