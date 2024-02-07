import { ScrollEmitArg } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { ReceiveHandler } from '../types';

export const receiveToScroll: ReceiveHandler<ScrollEmitArg> = (event, context, sync) => {
  const $target = mirror.getNode<HTMLElement>(event.id);
  if (!$target) return;

  if (($target as Node) === context.$iframe.contentDocument) {
    context.$iframe.contentWindow?.scrollTo({
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
