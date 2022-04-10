import { MouseInteractionParam } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { ReceiveContext } from '../types';
import { moveAndHover } from '../utils/hover';

export function receiveMouseInteraction(
  event: MouseInteractionParam,
  context: ReceiveContext,
  sync: boolean
) {
  const $target = mirror.getNode<HTMLElement>(event.id);
  if (!$target) return;

  switch (event.action) {
    case 'blur': {
      // @TODO
      break;
    }
    case 'focus': {
      // @TODO
      break;
    }
    case 'click':
    case 'touchend':
    case 'touchstart': {
      if (!sync) {
        moveAndHover(
          event.x,
          event.y,
          event.id,
          context.$cursor,
          context.$iframe.contentDocument!
        );

        context.$cursor.classList.remove('active');
        setTimeout(() => {
          context.$cursor.classList.add('active');
        });
      }
    }
  }
}
