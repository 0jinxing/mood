import { isElement, mirror, serialize, SNWithId } from '@mood/snapshot';
import { hookMethod } from '@mood/utils';

export type PatternPlayload = {
  rep: string | null;
  val: number | SNWithId[] | number[];
};

export function hocPattern() {
  const createPattern = CanvasRenderingContext2D.prototype.createPattern;

  return hookMethod(
    CanvasRenderingContext2D.prototype,
    'createPattern',

    <typeof createPattern>function (image, repetition) {
      const pattern: CanvasPattern = createPattern.call(this, image, repetition);

      let val: PatternPlayload['val'] = 0;

      if (image instanceof ImageBitmap) {
        val = Object.values(image);
      } else if (isElement(image)) {
        val = mirror.getId(image) || serialize(image, document);
      }

      pattern.__p = <PatternPlayload>{ rep: repetition, val };

      return pattern;
    }
  );
}
