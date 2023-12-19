export const TypedArrayConstructors = [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array

  /** @Unsupported */
  // BigInt64Array,
  // BigUint64Array
] as const;

export type EncodeableTypedArray = (typeof TypedArrayConstructors)[number];

export const encodeTypedArray = (value: EncodeableTypedArray) => {
  return { constructor: value.constructor.name, values: Object.values(value) as number[] };
};

export const decodeTypedArray = (value: any) => {
  const Constructor = TypedArrayConstructors.find(
    constructor => constructor.name === value.constructor
  );

  if (!Constructor) {
    throw new Error(`TypedArray constructor not found: ${value.constructor}`);
  }

  return new Constructor(value.values);
};
