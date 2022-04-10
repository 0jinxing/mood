import { IncrementalParam } from 'packages/record';
import { Timer } from './models/timer';

export type RecCtx = {
  $iframe: HTMLIFrameElement;
  $cursor: HTMLElement;
  baseline: number;
  timer: Timer;
};

export type RecHandler<T extends IncrementalParam = IncrementalParam> = (
  event: T,
  context: RecCtx,
  sync: boolean
) => void;
