import { constructorValidate } from '../utils';

export type ArrayBufferEncoded = {
  constructor: 'ArrayBuffer';
  byteLength: number;

  buffer: number[];
};

export function isArrayBufferEncoded(value: any): value is ArrayBufferEncoded {
  return value && value.constructor === 'ArrayBuffer';
}

export const encodeArrayBuffer = (decoded: ArrayBuffer): ArrayBufferEncoded => {
  constructorValidate(decoded, ArrayBuffer);

  return {
    constructor: 'ArrayBuffer',
    buffer: Object.values(new Uint8Array(decoded)),
    byteLength: decoded.byteLength
  };
};

export const decodeArrayBuffer = (encoded: ArrayBufferEncoded) => {
  const decoded = new ArrayBuffer(encoded.byteLength);
  const view = new Uint8Array(decoded);
  for (let i = 0; i < encoded.buffer.length; i++) {
    view[i] = encoded.buffer[i];
  }
  return decoded;
};
