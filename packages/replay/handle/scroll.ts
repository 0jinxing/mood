import { ScrollEmitArg } from '@mood/record';
import { EmitHandler } from '../types';

export const handleScrollEmit: EmitHandler<ScrollEmitArg> = (event, { $iframe, mirror }, sync) => {
  const $target = mirror.getNode<HTMLElement>(event.id);
  if (!$target) return;

  if (($target as Node) === $iframe.contentDocument) {
    $iframe.contentWindow?.scrollTo({
      top: event.y,
      left: event.x,
      behavior: sync ? 'auto' : 'smooth'
    });
  } else {
    try {
      $target.scrollTop = event.y;
      $target.scrollLeft = event.x;
    } catch (err) {
      /**
       * seldomly we may found scroll target was removed before
       * its last scroll event.
       */
    }
  }
};
