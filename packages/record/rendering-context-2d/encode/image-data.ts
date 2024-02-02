export type ImageDataEncoded = {
  constructor: 'ImageData';

  height: number;
  width: number;

  data: number[];
};

export function isImageDataEncoded(value: any): value is ImageDataEncoded {
  return value && value.constructor === 'ImageData';
}

export const encodeImageData = (value: ImageData): ImageDataEncoded => {
  return {
    constructor: 'ImageData',
    height: value.height,
    width: value.width,

    data: Object.values(value.data)
  };
};

export const decodeImageData = (encoded: ImageDataEncoded) => {
  return new ImageData(new Uint8ClampedArray(encoded.data), encoded.width, encoded.height);
};
