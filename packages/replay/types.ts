import { Timer } from './models/timer';

export type ReceiveContext = {
  $iframe: HTMLIFrameElement;
  $cursor: HTMLElement;
  baseline: number;
  timer: Timer;
};
