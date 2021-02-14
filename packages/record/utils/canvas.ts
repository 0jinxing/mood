import { mirror } from 'packages/snapshot';
import {
  CanvasGradientExtra,
  CanvasGradientStop
} from '../canvas/canvas-gradient';
import { CanvasPatternPlain } from '../canvas/canvas-pattern';
import { ImageDataExtra } from '../canvas/image-data';
import { Path2DExtra } from '../canvas/path2d';

export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

type ElementSN = { sn: number };

export type RestoreType =
  | ImageDataExtra
  | Path2DExtra
  | CanvasPatternPlain
  | CanvasGradientExtra
  | ElementSN
  | Primitive
  | Array<ResponseType>;

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

  switch (value.k) {
    case 'imageData': {
      return restoreImageDataExtra(value);
    }
    case 'path2d': {
      return restorePath2DExtra(value);
    }
    case 'pattern': {
      return restorePatternExtra(value);
    }
    case 'linear':
    case 'radial': {
      return restoreGradientExtra(value);
    }
  }
}

export function restoreElement({ sn }: ElementSN) {
  return mirror.getNode(sn);
}

function restoreImageDataExtra({ e }: ImageDataExtra) {
  const [width, height, ...data] = e;
  const result = new ImageData(width, height);
  result.data.set(data);

  return result;
}

function restorePath2DExtra({ e }: Path2DExtra) {
  const [path, patch] = e;
  const arg = <string | Path2D | undefined>restore(path);
  const result = new Path2D(arg);
  for (const [prop, args] of patch) {
    result[prop].apply(result, args);
  }
  return result;
}

function restorePatternExtra({ e }: CanvasPatternPlain) {
  const [canvasId, sourceId, repetition] = e;
  const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);

  type SourceElement = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;

  const source = mirror.getNode<SourceElement>(sourceId);
  const ctx = canvas?.getContext('2d');

  if (!source || !ctx) return null;

  return ctx.createPattern(source, repetition);
}

function restoreGradientExtra(value: CanvasGradientExtra) {
  const [canvasId] = value.e;
  const canvas = mirror.getNode<HTMLCanvasElement>(canvasId);

  const ctx = canvas?.getContext('2d');
  if (!ctx) return null;

  let result: CanvasGradient;

  const stop = value.e[value.e.length - 1] as CanvasGradientStop[];

  if (value.k === 'linear') {
    const [, x0, y0, x1, y1] = value.e;
    result = ctx.createLinearGradient(x0, y0, x1, y1);
  } else {
    const [, x0, y0, r0, x1, y1, r1] = value.e;
    result = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }
  for (const [offset, color] of stop) {
    result.addColorStop(offset, color);
  }
  return result;
}
