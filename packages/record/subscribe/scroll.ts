import { mirror } from '@mood/snapshot';
import { on, throttle } from '../utils';
import { SourceType } from '../constant';

export type SubscribeToScrollArg = {
  source: SourceType.SCROLL;
  id: number;
  x: number;
  y: number;
};

export type SubscribeToScrollEmit = (arg: SubscribeToScrollArg) => void;

export function subscribeToScroll(cb: SubscribeToScrollEmit) {
  const updatePosition = throttle<UIEvent>(({ target }) => {
    if (!target) return;

    const id = mirror.getId(target);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === document) $scroll = document.scrollingElement as HTMLElement;

    cb({
      id,
      source: SourceType.SCROLL,
      x: $scroll.scrollLeft,
      y: $scroll.scrollTop
    });
  }, 100);
  return on('scroll', updatePosition);
}
