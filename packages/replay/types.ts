import { Mirror } from '@mood/snapshot';
import { Scheduler } from './model/scheduler';

export type EmitHandlerContext = {
  mirror: Mirror;
  $iframe: HTMLIFrameElement;
  $cursor: HTMLElement;
  baseline: number;
  scheduler: Scheduler;
};

export type EmitHandler<T> = (event: T, context: EmitHandlerContext, sync: boolean) => void;
