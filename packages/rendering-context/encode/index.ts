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

export type Decodeable =
  | Primitive
  | ArrayBufferEncoded
  | DataViewEncoded
  | DOMMatrixEncoded
  | ImageDataEncoded
  | TypedArrayEncoded
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
    isTypedArrayEncoded(value)
  );
}

export type Encodeable =
  | Primitive
  | ArrayBuffer
  | DataView
  | DOMMatrix
  | ImageData
  | EncodeableTypedArray
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
    TypedArrayConstructors.some(constructor => value instanceof constructor)
  );
}

export function encode(value: Encodeable): Decodeable {
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
  } else if (Array.isArray(value)) {
    return value.map(encode);
  }
  throw new TypeError('Unknown value');
}

export function decode(value: Decodeable): Encodeable {
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
  } else if (Array.isArray(value)) {
    return value.map(decode);
  }
  throw new TypeError('Unknown encoded value');
}
