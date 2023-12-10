import { isPrimitive } from 'utility-types';
import { serializeArrayBuffer, serializeDataView, serializeTypedArray } from './array-like';
import { serializeHTMLImageElement, serializeImageData } from './image-source';
import { serializePath2D } from './path2d';

export function serializeArgs(value: unknown): unknown {
  if (isPrimitive(value)) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(v => serializeArgs(v));
  }
  if (value instanceof ArrayBuffer) {
    return serializeArrayBuffer(value);
  } else if (value instanceof DataView) {
    return serializeDataView(value);
  } else if (
    value instanceof Float32Array ||
    value instanceof Float64Array ||
    value instanceof Int32Array ||
    value instanceof Uint32Array ||
    value instanceof Uint8Array ||
    value instanceof Uint16Array ||
    value instanceof Int16Array ||
    value instanceof Int8Array ||
    value instanceof Uint8ClampedArray
  ) {
    return serializeTypedArray(value);
  } else if (
    value instanceof HTMLImageElement ||
    value instanceof SVGImageElement ||
    value instanceof HTMLVideoElement ||
    value instanceof HTMLCanvasElement
  ) {
    serializeHTMLImageElement(value);
  } else if (value instanceof ImageData) {
    return serializeImageData(value);
  } else if (value instanceof Path2D) {
    serializePath2D(value);
  }
}
