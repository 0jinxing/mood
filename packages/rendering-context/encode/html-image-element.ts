import { mirror } from '@mood/snapshot';

export type HTMLImageElementEncoded = {
  constructor: 'HTMLImageElement';
  id: number;
};

export function isHTMLImageElementEncoded(value: any): value is HTMLImageElementEncoded {
  return value && value.constructor === 'HTMLImageElement';
}

export function encodeHTMLImageElement(element: HTMLImageElement): HTMLImageElementEncoded {
  return { constructor: 'HTMLImageElement', id: mirror.getId(element) };
}

export const decodeHTMLImageElement = (encoded: HTMLImageElementEncoded) => {
  return mirror.getNode<HTMLImageElement>(encoded.id);
};
