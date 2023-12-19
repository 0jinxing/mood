export const encodeDataView = (value: DataView) => {
  return {
    constructor: 'DataView',
    byteLength: value.byteLength,
    byteOffset: value.byteOffset,
    buffer: Object.values(new Uint8Array(value.buffer))
  };
};

export const decodeDataView = (value: any) => {
  return new DataView(new Uint8Array(value.buffer).buffer, value.byteOffset, value.byteLength);
};
