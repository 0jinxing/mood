import { SubscribeEmitArg } from '@mood/record';
import { Timer } from './models/timer';

export type ReceiveContext = {
  $iframe: HTMLIFrameElement;
  $cursor: HTMLElement;
  baseline: number;
  timer: Timer;
};

export type ReceiveHandler<T extends SubscribeEmitArg = SubscribeEmitArg> = (
  event: T,
  context: ReceiveContext,
  sync: boolean
) => void;
