import { Addition } from '@mood/snapshot';

export type ImageDataAddition = Addition<
  'imageData',
  [width: number, height: number, ...data: number[]]
>;
