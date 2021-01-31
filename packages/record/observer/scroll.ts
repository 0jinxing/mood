import { on, throttle } from '../utils';
import { mirror, TNode } from '@mood/snapshot';
import { IncrementalSource } from '../constant';

export type ScrollData = {
  source: IncrementalSource.SCROLL;
  id: number;
  x: number;
  y: number;
};

export type ScrollCb = (param: ScrollData) => void;

export function scrollObserve(cb: ScrollCb) {
  const updatePosition = throttle<UIEvent>(event => {
    const { target } = event;
    const id = mirror.getId(target as Node | TNode);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === document) $scroll = document.scrollingElement as HTMLElement;

    cb({
      source: IncrementalSource.SCROLL,
      id,
      x: $scroll.scrollLeft,
      y: $scroll.scrollTop
    });

  }, 100);
  return on('scroll', updatePosition);
}
