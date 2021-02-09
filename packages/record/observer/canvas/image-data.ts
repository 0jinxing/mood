export type ImageDataPlain = {
  data: number[];
  height: number;
  width: number;
};

declare global {
  interface ImageData {
    $plain?: () => ImageDataPlain;
  }
}

export function extendImageData() {
  Object.defineProperty(ImageData.prototype, '$plain', {
    get() {
      return function () {
        const self = this as ImageData;
        return { data: self.data, width: self.width, height: self.height };
      };
    },
    enumerable: false
  });

  return () => {
    delete ImageData.prototype.$plain;
  };
}

export function restoreImageData(plain: ImageDataPlain) {
  const imageData = new ImageData(plain.width, plain.height);
  imageData.data.set(plain.data);
  return imageData;
}
