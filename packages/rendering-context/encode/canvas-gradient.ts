import { hookMethod } from '@mood/utils';

export type CanvasGradientEncodable = {
  create: 'createLinearGradient' | 'createRadialGradient' | 'createConicGradient';
  args: number[];
  colorStops: [number, string][];
};

const canvasGradientMap = new WeakMap<CanvasGradient, CanvasGradientEncodable>();

export function makeCanvasGradientEncodable() {
  hookMethod(CanvasRenderingContext2D.prototype, 'createLinearGradient', function (ret, ...args) {
    canvasGradientMap.set(ret, { create: 'createLinearGradient', args, colorStops: [] });
  });

  hookMethod(CanvasRenderingContext2D.prototype, 'createRadialGradient', function (ret, ...args) {
    canvasGradientMap.set(ret, { create: 'createRadialGradient', args, colorStops: [] });
  });
  hookMethod(CanvasRenderingContext2D.prototype, 'createConicGradient', function (ret, ...args) {
    canvasGradientMap.set(ret, { create: 'createConicGradient', args, colorStops: [] });
  });

  hookMethod(CanvasGradient.prototype, 'addColorStop', function (ret, ...args) {
    const encodable = canvasGradientMap.get(this);
    if (encodable) {
      encodable.colorStops.push(args);
    }
  });
}

export function encodeCanvasGradient(gradient: CanvasGradient): CanvasGradientEncodable {
  const encodable = canvasGradientMap.get(gradient);

  if (!encodable) {
    throw new Error('CanvasGradient not encodable');
  }
  return encodable;
}

export function decodeCanvasGradient(
  encoded: CanvasGradientEncodable,
  ctx: CanvasRenderingContext2D
) {
  const { create, args, colorStops } = encoded;

  const gradient = ctx[create].apply(ctx, args);

  for (const [offset, color] of colorStops) {
    gradient.addColorStop(offset, color);
  }
  return gradient;
}
