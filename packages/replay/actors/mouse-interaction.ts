import { SubscribeToMouseInteractionArg } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { ReceiveHandler } from '../types';
import { moveAndHover } from '../utils/hover';

export const receiveToMouseInteraction: ReceiveHandler<SubscribeToMouseInteractionArg> = (
  event,
  { $iframe, $cursor },
  sync
) => {
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
        moveAndHover(event.x, event.y, event.id, $cursor, $iframe.contentDocument!);

        $cursor.classList.remove('active');
        setTimeout(() => $cursor.classList.add('active'));
      }
    }
  }
};
