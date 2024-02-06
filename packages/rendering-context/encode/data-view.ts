export type DataViewEncoded = {
  constructor: 'DataView';
  byteLength: number;
  byteOffset: number;

  buffer: number[];
};

export function isDataViewEncoded(value: any): value is DataViewEncoded {
  return value && value.constructor === 'DataView';
}

export const encodeDataView = (decoded: DataView): DataViewEncoded => {
  return {
    constructor: 'DataView',
    byteLength: decoded.byteLength,
    byteOffset: decoded.byteOffset,
    buffer: Object.values(new Uint8Array(decoded.buffer))
  };
};

export const decodeDataView = (encoded: DataViewEncoded) => {
  return new DataView(
    new Uint8Array(encoded.buffer).buffer,
    encoded.byteOffset,
    encoded.byteLength
  );
};
