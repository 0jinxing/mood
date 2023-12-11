import { hookMethod } from '@mood/utils';

export function makeCanvasGradientSerializable() {
  hookMethod(
    CanvasRenderingContext2D.prototype,
    'createLinearGradient',
    // [x0: number, y0: number, x1: number, y1: number]
    function (...args) {}
  );

  hookMethod(
    CanvasRenderingContext2D.prototype,
    'createRadialGradient',
    // [x0: number, y0: number, r0: number, x1: number, y1: number, r1: number]
    function (...args) {}
  );
  hookMethod(
    CanvasRenderingContext2D.prototype,
    'createConicGradient',
    // [startAngle: number, x: number, y: number]
    function (...args) {}
  );

  hookMethod(CanvasGradient.prototype, 'addColorStop', function () {});
}

export type CanvasGradientSerialized = (
  | { name: 'LinearGradient'; params: Parameters<CanvasRenderingContext2D['createLinearGradient']> }
  | { name: 'RadialGradient'; params: Parameters<CanvasRenderingContext2D['createRadialGradient']> }
  | { name: 'ConicGradient'; params: Parameters<CanvasRenderingContext2D['createConicGradient']> }
) & { props: { colorStops: Array<{ offset: number; color: string }> } };
