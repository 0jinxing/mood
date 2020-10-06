import { on, throttle } from '../utils';
import { mirror, TNode } from '@mood/snapshot';

export type ScrollPosition = {
  id: number;
  x: number;
  y: number;
};

export type ScrollCallback = (position: ScrollPosition) => void;

function initScrollObserver(cb: ScrollCallback): Function {
  const updatePosition = throttle<UIEvent>(event => {
    const { target } = event;
    const id = mirror.getId(target as Node | TNode);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === document) $scroll = document.scrollingElement as HTMLElement;
    cb({ id, x: $scroll.scrollLeft, y: $scroll.scrollTop });
  }, 100);
  return on('scroll', updatePosition);
}

export default initScrollObserver;
