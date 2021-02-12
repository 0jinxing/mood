import { mirror } from '@mood/snapshot';
import { on, throttle } from '../utils';
import { IncrementalSource } from '../constant';

export type ScrollParam = {
  source: IncrementalSource.SCROLL;
  id: number;
  x: number;
  y: number;
};

export type ScrollCallback = (param: ScrollParam) => void;

export function scroll(cb: ScrollCallback) {
  const updatePosition = throttle<UIEvent>(({ target }) => {
    if (!target) return;
    
    const id = mirror.getId(target);
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
