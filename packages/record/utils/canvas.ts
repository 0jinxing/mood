import { ElementAddition, mirror } from 'packages/snapshot';
import {
  CanvasGradientAddition,
  CanvasGradientStop
} from '../canvas/canvas-gradient';
import { CanvasPatternAddition } from '../canvas/canvas-pattern';
import { ImageDataAddition } from '../canvas/image-data';
import { Path2DAddition } from '../canvas/path2d';

export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

export type RestoreType =
  | ImageDataAddition
  | Path2DAddition
  | CanvasPatternAddition
  | CanvasGradientAddition
  | ElementAddition
  | Primitive
  | Array<RestoreType>;

export function restore(value: RestoreType): any {
  if (value instanceof Array) {
    return value.map(restore);
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if ('sn' in value) {
    return restoreElement(value);
  }

  switch (value.kind) {
    case 'imageData': {
      return restoreImageData(value);
    }
    case 'path2d': {
      return restorePath2D(value);
    }
    case 'pattern': {
      return restorePattern(value);
    }
    case 'linear':
    case 'radial': {
      return restoreGradient(value);
    }
  }
}

export function restoreElement(addition: ElementAddition) {
  return mirror.getNode(addition.base);
}

function restoreImageData(addition: ImageDataAddition) {
  const [width, height, ...data] = addition.base;
  const result = new ImageData(width, height);
  result.data.set(data);

  return result;
}

function restorePath2D(addition: Path2DAddition) {
  const [path, patch] = addition.base;
  const arg = <string | Path2D | undefined>restore(path);
  const result = new Path2D(arg);
  for (const [prop, args] of patch) {
    result[prop].apply(result, args);
  }
  return result;
}

function restorePattern(addition: CanvasPatternAddition) {
  const [canvasId, sourceId, repetition] = addition.base;
  const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);

  type SourceElement = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;

  const source = mirror.getNode<SourceElement>(sourceId);
  const ctx = canvas?.getContext('2d');

  if (!source || !ctx) return null;

  return ctx.createPattern(source, repetition);
}

function restoreGradient(addition: CanvasGradientAddition) {
  const [canvasId] = addition.base;
  const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);

  const ctx = canvas?.getContext('2d');
  if (!ctx) return null;

  let result: CanvasGradient;

  const stop = addition.base[addition.base.length - 1] as CanvasGradientStop[];

  if (addition.kind === 'linear') {
    const [, x0, y0, x1, y1] = addition.base;
    result = ctx.createLinearGradient(x0, y0, x1, y1);
  } else {
    const [, x0, y0, r0, x1, y1, r1] = addition.base;
    result = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }
  for (const [offset, color] of stop) {
    result.addColorStop(offset, color);
  }
  return result;
}
