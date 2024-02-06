import { encode } from 'base64-arraybuffer';

export interface ImageBitmapWorker extends Worker {
  onmessage: (this: ImageBitmapWorker, e: MessageEvent<{ base64: string }>) => void;
  postMessage: (message: { bitmap: ImageBitmap }) => void;
}

onmessage = async function (e: MessageEvent<{ bitmap: ImageBitmap }>) {
  const bitmap = e.data.bitmap;
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);

  const context = canvas.getContext('2d');

  context?.drawImage(bitmap, 0, 0);

  bitmap.close();

  const blob = await canvas.convertToBlob();

  const base64 = encode(await blob.arrayBuffer());

  postMessage({ base64 });
};
