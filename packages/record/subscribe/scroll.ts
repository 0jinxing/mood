import { mirror } from '@mood/snapshot';
import { on, throttle } from '@mood/utils';
import { SourceTypes } from '../types';

export type SubscribeToScrollArg = {
  source: SourceTypes.SCROLL;
  id: number;
  x: number;
  y: number;
};

export type SubscribeToScrollEmit = (arg: SubscribeToScrollArg) => void;

export function subscribeToScroll(cb: SubscribeToScrollEmit) {
  const throttleCb = throttle<UIEvent>(({ target }) => {
    if (!target) return;

    const id = mirror.getId(target);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === document) $scroll = document.scrollingElement as HTMLElement;

    cb({ id, source: SourceTypes.SCROLL, x: $scroll.scrollLeft, y: $scroll.scrollTop });
  }, 100);
  return on('scroll', throttleCb);
}
