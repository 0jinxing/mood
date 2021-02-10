import { Plain } from '../../types';

export type ImageDataPlain = {
  impl: 'imageData';
  restore: {
    data: number[];
    height: number;
    width: number;
  };
};

declare global {
  interface ImageData extends Plain<ImageDataPlain> {
    $plain?: () => ImageDataPlain;
  }
}

export function extendImageData() {
  Object.defineProperty(ImageData.prototype, '$plain', {
    value: function () {
      const self = this as ImageData;
      return { data: self.data, width: self.width, height: self.height };
    },
    enumerable: false
  });

  return () => {
    delete ImageData.prototype.$plain;
  };
}

export function restoreImageData({ restore }: ImageDataPlain) {
  const imageData = new ImageData(restore.width, restore.height);
  imageData.data.set(restore.data);
  return imageData;
}
