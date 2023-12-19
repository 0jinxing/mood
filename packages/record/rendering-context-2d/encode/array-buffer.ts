export const encodeArrayBuffer = (value: ArrayBuffer) => {
  return { constructor: value.constructor.name, values: Object.values(new Uint8Array(value)) };
};

export const decodeArrayBuffer = (value: any) => {
  return new ArrayBuffer(value.values);
};
