import { on, throttle } from '@mood/utils';
import { ObserveFunc, ST } from '../types';

export type ScrollEmitArg = {
  source: ST.SCROLL;
  id: number;
  x: number;
  y: number;
};

export const observeScroll: ObserveFunc<ScrollEmitArg> = (cb, { mirror, doc }) => {
  const throttleCb = throttle<UIEvent>(({ target }) => {
    if (!target) return;

    const id = mirror.getId(target);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === doc) $scroll = doc.scrollingElement as HTMLElement;

    cb({ id, source: ST.SCROLL, x: $scroll.scrollLeft, y: $scroll.scrollTop });
  }, 100);
  return on(doc, 'scroll', throttleCb);
};
