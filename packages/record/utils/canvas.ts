import { mirror } from 'packages/snapshot';
import { CanvasGradientPlain } from '../canvas/canvas-gradient';
import { CanvasPatternPlain } from '../canvas/canvas-pattern';
import { ImageDataPlain } from '../canvas/image-data';
import { Path2DPlain } from '../canvas/path2d';

export function restoreExtra(
  value: ImageDataPlain | Path2DPlain | CanvasPatternPlain | CanvasGradientPlain
) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (value.kind === 'imageData') {
    const { width, height, data } = value.extra;
    const result = new ImageData(width, height);
    result.data.set(data);

    return result;
  } else if (value.kind === 'path2d') {
    const restore = value.extra;
    // TODO proxy Path2D constructor
    const result = new Path2D();
    for (const [prop, args] of restore) {
      result[prop].apply(result, args);
    }
    return result;
  } else if (value.kind === 'pattern') {
    const {
      canvasId,
      create: [sourceId, repetition]
    } = value.extra;
    const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);

    type SourceElement =
      | HTMLVideoElement
      | HTMLCanvasElement
      | HTMLImageElement;

    const source = mirror.getNode<SourceElement>(sourceId);

    if (!source || !canvas) return;

    return canvas.getContext('2d')?.createPattern(source, repetition);
  } else if (value.kind === 'linear') {
    const {
      canvasId,
      create: [x0, y0, x1, y1],
      stop
    } = value.extra;
    const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);
    const ctx = canvas?.getContext('2d');
    const result = ctx?.createLinearGradient(x0, y0, x1, y1);
    for (const [offset, color] of stop) {
      result?.addColorStop(offset, color);
    }

    return result;
  } else if (value.kind === 'radial') {
    const {
      canvasId,
      create: [x0, y0, r0, x1, y1, r1],
      stop
    } = value.extra;
    const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);
    const ctx = canvas?.getContext('2d');
    const result = ctx?.createRadialGradient(x0, y0, r0, x1, y1, r1);
    for (const [offset, color] of stop) {
      result?.addColorStop(offset, color);
    }

    return result;
  }
}
