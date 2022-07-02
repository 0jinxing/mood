import { SubscribeToMouseMoveArg } from '@mood/record';
import { ReceiveHandler } from '../types';
import { chunk } from '../utils/chunk';
import { moveAndHover } from '../utils/pseudo';

export const receiveToMouseMove: ReceiveHandler<SubscribeToMouseMoveArg> = (
  event,
  { $iframe, $cursor, scheduler, baseline },
  sync
) => {
  const $doc = $iframe.contentDocument!;

  if (sync) {
    const [id, x, y] = event.ps.slice(event.ps.length - 4);
    moveAndHover(x, y, id, $cursor, $doc);
  } else {
    chunk(event.ps, 4).forEach(([id, x, y, timestamp]) => {
      scheduler.push({
        exec: () => moveAndHover(x, y, id, $cursor, $doc),
        delay: timestamp - baseline
      });
    });
  }
};
