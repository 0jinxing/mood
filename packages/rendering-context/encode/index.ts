import { Primitive, isPrimitive } from 'utility-types';
import {
  ArrayBufferEncoded,
  decodeArrayBuffer,
  encodeArrayBuffer,
  isArrayBufferEncoded
} from './array-buffer';
import { DataViewEncoded, decodeDataView, encodeDataView, isDataViewEncoded } from './data-view';
import {
  DOMMatrixEncoded,
  decodeDOMMatrix,
  encodeDOMMatrix,
  isDOMMatrixEncoded
} from './dom-matrix';
import {
  ImageDataEncoded,
  decodeImageData,
  encodeImageData,
  isImageDataEncoded
} from './image-data';
import {
  EncodeableTypedArray,
  TypedArrayConstructors,
  TypedArrayEncoded,
  decodeTypedArray,
  encodeTypedArray,
  isTypedArrayEncoded
} from './typed-array';
import {
  WebGLObject,
  WebGLObjectEncoded,
  decodeWebGLObject,
  encodeWebGLObject,
  isWebGLObject,
  isWebGLObjectEncoded
} from './webgl';
import {
  HTMLImageElementEncoded,
  decodeHTMLImageElement,
  encodeHTMLImageElement,
  isHTMLImageElementEncoded
} from './html-image-element';
import { Mirror } from '@mood/snapshot';

export type Decodeable =
  | Primitive
  | ArrayBufferEncoded
  | DataViewEncoded
  | DOMMatrixEncoded
  | ImageDataEncoded
  | TypedArrayEncoded
  | WebGLObjectEncoded
  | HTMLImageElementEncoded
  | Array<Decodeable>;

export function isDecodeable(value: unknown): value is Decodeable {
  if (Array.isArray(value)) {
    return value.every(v => isDecodeable(v));
  }
  return (
    isArrayBufferEncoded(value) ||
    isDataViewEncoded(value) ||
    isDOMMatrixEncoded(value) ||
    isImageDataEncoded(value) ||
    isTypedArrayEncoded(value) ||
    isWebGLObjectEncoded(value)
  );
}

export type Encodeable =
  | Primitive
  | ArrayBuffer
  | DataView
  | DOMMatrix
  | ImageData
  | EncodeableTypedArray
  | WebGLObject
  | Array<Encodeable>;

export function isEncodeable(value: unknown): value is Encodeable {
  if (Array.isArray(value)) {
    return value.every(v => isEncodeable(v));
  }
  return (
    isPrimitive(value) ||
    value instanceof ArrayBuffer ||
    value instanceof DataView ||
    value instanceof DOMMatrix ||
    value instanceof ImageData ||
    TypedArrayConstructors.some(constructor => value instanceof constructor) ||
    isWebGLObjectEncoded(value)
  );
}

export function encode(value: Encodeable, mirror: Mirror, context?: RenderingContext): Decodeable {
  if (isPrimitive(value)) {
    return value;
  } else if (value instanceof ArrayBuffer) {
    return encodeArrayBuffer(value);
  } else if (value instanceof DataView) {
    return encodeDataView(value);
  } else if (value instanceof DOMMatrix) {
    return encodeDOMMatrix(value);
  } else if (value instanceof ImageData) {
    return encodeImageData(value);
  } else if (TypedArrayConstructors.some(constructor => value instanceof constructor)) {
    return encodeTypedArray(value as EncodeableTypedArray);
  } else if (isWebGLObject(value) && context) {
    return encodeWebGLObject(value, mirror, context)!;
  } else if (value instanceof HTMLImageElement) {
    return encodeHTMLImageElement(value, mirror);
  } else if (Array.isArray(value)) {
    return value.map(item => encode(item, mirror, context));
  }
  throw new TypeError('Unknown value');
}

export function decode(value: Decodeable, mirror: Mirror): Encodeable {
  if (isPrimitive(value)) {
    return value;
  } else if (isArrayBufferEncoded(value)) {
    return decodeArrayBuffer(value);
  } else if (isDataViewEncoded(value)) {
    return decodeDataView(value);
  } else if (isDOMMatrixEncoded(value)) {
    return decodeDOMMatrix(value);
  } else if (isImageDataEncoded(value)) {
    return decodeImageData(value);
  } else if (isTypedArrayEncoded(value)) {
    return decodeTypedArray(value);
  } else if (isWebGLObjectEncoded(value)) {
    return decodeWebGLObject(value, mirror);
  } else if (isHTMLImageElementEncoded(value)) {
    return decodeHTMLImageElement(value, mirror);
  } else if (Array.isArray(value)) {
    return value.map(v => decode(v, mirror));
  }
  throw new TypeError('Unknown encoded value');
}

export * from './webgl';
