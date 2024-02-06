import Worker from '../workers/image-bitmap.worker?worker';
import type { ImageBitmapWorker } from '../workers/image-bitmap.worker';
import { mirror } from '@mood/snapshot';
import { pipeThroughWorker } from '@mood/utils';

export type HTMLCanvasElementEncoded = { kind: 'HTMLCanvasElement' } & (
  | { base64: string }
  | { id: number }
);

export function isHTMLCanvasElementEncoded(value: any): value is HTMLCanvasElementEncoded {
  return value && value.constructor === 'HTMLCanvasElement';
}

export async function encodeHTMLCanvasElement(
  element: HTMLCanvasElement
): Promise<HTMLCanvasElementEncoded> {
  const id = mirror.getId(element);

  if (id) {
    return { kind: 'HTMLCanvasElement', id };
  }
  const worker = new Worker();
  const bitmap = await createImageBitmap(element);

  return {
    ...(await pipeThroughWorker(worker as ImageBitmapWorker, { bitmap })),
    kind: 'HTMLCanvasElement'
  };
}

export const decodeHTMLCanvasElement = (encoded: HTMLCanvasElementEncoded) => {
  if ('id' in encoded) {
    return mirror.getNode<HTMLCanvasElement>(encoded.id);
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const image = new Image();
  image.src = `data:image/png;base64,${encoded.base64}`;
  context?.drawImage(image, 0, 0);
};
