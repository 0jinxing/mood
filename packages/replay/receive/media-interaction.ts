import { MediaInteractionArg } from '@mood/record';
import { mirror } from '@mood/snapshot';
import { ReceiveHandler } from '../types';

export const receiveToMediaInteraction: ReceiveHandler<MediaInteractionArg> = event => {
  const $target = mirror.getNode<HTMLMediaElement>(event.id);

  if (!$target) return;

  if (event.action === 'play') {
    if ($target.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      $target.play();
    } else {
      $target.addEventListener('canplay', () => $target.play());
    }
  } else if (event.action === 'pause') {
    $target.pause();
  }
};
