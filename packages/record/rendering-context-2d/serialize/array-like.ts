export type TypedArray =
  | Float32Array
  | Float64Array
  | Int32Array
  | Uint32Array
  | Uint8Array
  | Uint16Array
  | Int16Array
  | Int8Array
  | Uint8ClampedArray;

export type SerializedTypedArray = {
  name:
    | 'Float32Array'
    | 'Float64Array'
    | 'Int32Array'
    | 'Uint32Array'
    | 'Uint8Array'
    | 'Uint16Array'
    | 'Int16Array'
    | 'Int8Array'
    | 'Uint8ClampedArray';

  args: number[];
};

export type SerializedArrayBuffer = {
  name: 'ArrayBuffer';
  value: number[];
};

export type SerializedDataView = {
  name: 'DataView';
  byteLength: number;
  byteOffset: number;
  buffer: number[];
};

export const serializeTypedArray = (value: TypedArray) => {
  return { name: value.constructor.name, args: Object.values(value) } as SerializedTypedArray;
};

export const serializeArrayBuffer = (value: ArrayBuffer): SerializedArrayBuffer => {
  return {
    name: 'ArrayBuffer',
    value: Object.values(new Uint8Array(value))
  };
};

export const serializeDataView = (value: DataView) => {
  return {
    name: 'DataView',
    byteLength: value.byteLength,
    byteOffset: value.byteOffset,
    buffer: Object.values(new Uint8Array(value.buffer))
  };
};
