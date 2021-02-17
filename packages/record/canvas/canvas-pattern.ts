import { Addition } from '@mood/snapshot';

export type CanvasPatternAddition = Addition<
  'pattern',
  [canvasId: number, sn: number, repetition: string | null]
>;
