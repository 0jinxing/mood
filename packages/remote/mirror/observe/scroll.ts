import { ObserveFunc } from '@mood/record';
import { on } from '@mood/utils';

export type ScrollEvtArg = {
  ctor: 'Event';
  name: 'scroll';
  target: number;
  top: number;
  left: number;
};

export const observeScroll: ObserveFunc<ScrollEvtArg> = (emit, options) => {
  return on(options.doc, 'scroll', e => {
    const target = e.target as HTMLElement;
    emit({
      ctor: 'Event',
      name: 'scroll',
      target: options.mirror.getId(target),
      top: target.scrollTop,
      left: target.scrollLeft
    });
  });
};
