import { SubscribeEmitArg } from '@mood/record';
import { Scheduler } from './model/scheduler';

export type ReceiveContext = {
  $iframe: HTMLIFrameElement;
  $cursor: HTMLElement;
  baseline: number;
  scheduler: Scheduler;
};

export type ReceiveHandler<T> = (event: T, context: ReceiveContext, sync: boolean) => void;
