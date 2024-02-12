import { Mirror } from '@mood/snapshot';

export type HTMLImageElementEncoded = {
  constructor: 'HTMLImageElement';
  id: number;
  src: string;
};

export function isHTMLImageElementEncoded(value: any): value is HTMLImageElementEncoded {
  return value && value.constructor === 'HTMLImageElement';
}

export function encodeHTMLImageElement(
  element: HTMLImageElement,
  mirror: Mirror
): HTMLImageElementEncoded {
  return {
    constructor: 'HTMLImageElement',
    id: mirror.getId(element),
    src: element.src
  };
}

export const decodeHTMLImageElement = (encoded: HTMLImageElementEncoded, mirror: Mirror) => {
  let el = mirror.getNode<HTMLImageElement>(encoded.id);
  if (!el) {
    el = document.createElement('img');
    el.crossOrigin = 'anonymous';
    el.src = encoded.src;
  }

  return el;
};
