import { MediaInteractionEmitArg } from '@mood/record';
import { EmitHandler } from '../types';

export const handleMediaInteractionEmit: EmitHandler<MediaInteractionEmitArg> = (
  event,
  { mirror }
) => {
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
