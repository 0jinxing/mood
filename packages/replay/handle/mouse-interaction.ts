import { MouseInteractionEmitArg } from '@mood/record';
import { EmitHandler } from '../types';
import { moveAndHover } from '../utils/hover';

export const handleMouseInteractionEmit: EmitHandler<MouseInteractionEmitArg> = (
  event,
  { $iframe, $cursor, mirror },
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
        moveAndHover(event.x, event.y, event.id, mirror, $cursor, $iframe.contentDocument!);

        $cursor.classList.remove('active');
        setTimeout(() => $cursor.classList.add('active'));
      }
    }
  }
};
