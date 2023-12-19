export const encodeImageData = (value: ImageData) => {
  return {
    constructor: 'ImageData',
    height: value.height,
    width: value.width,
    data: Object.values(value.data)
  };
};

export const decodeImageData = (value: any) => {
  return new ImageData(new Uint8ClampedArray(value.data), value.width, value.height);
};
