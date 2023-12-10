import { SNWithId, mirror, serialize } from '@mood/snapshot';

// type CanvasImageSource = HTMLOrSVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame;

export type CanvasImageSourceElement = HTMLOrSVGImageElement | HTMLVideoElement | HTMLCanvasElement;

export type SerializedHTMLImageElement =
  | { name: 'CanvasImageSourceElement'; id: number }
  | { name: 'CanvasImageSourceElement'; sn: SNWithId[] };

export const serializeHTMLImageElement = (
  el: CanvasImageSourceElement
): SerializedHTMLImageElement => {
  const id = mirror.getId(el);
  // @TODO HTMLCanvasElement 🤔 是否需要进一步处理
  return id >= 0
    ? { name: 'CanvasImageSourceElement', id }
    : { name: 'CanvasImageSourceElement', sn: serialize(el, document) };
};

export const serializeImageBitmap = (value: ImageBitmap) => {
  // TODO worker
};

export const serializeImageData = (value: ImageData) => {
  return {
    name: 'ImageData',
    height: value.height,
    width: value.width,
    data: Object.values(value.data)
  };
};
