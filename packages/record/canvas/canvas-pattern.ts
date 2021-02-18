import { Addition } from '@mood/snapshot';

export type CanvasPatternAddition = Addition<
  'pattern',
  {
    canvasId: number;
    nodeId: number;
    repetition: string | null;
  }
>;
