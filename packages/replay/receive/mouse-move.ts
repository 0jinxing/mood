import { MouseMoveParam } from '@mood/record';
import { ReceiveContext } from '../types';
import { chunk } from '../utils/chunk';
import { moveAndHover } from '../utils/hover';

export function receiveMouseMove(
  event: MouseMoveParam,
  context: ReceiveContext,
  sync: boolean
) {
  const $doc = context.$iframe.contentDocument!;
  if (sync) {
    const [id, x, y] = event.positions.slice(event.positions.length - 4);
    moveAndHover(x, y, id, context.$cursor, $doc);
  } else {
    chunk(event.positions, 4).forEach(([id, x, y, timestamp]) => {
      const action = {
        execAction: () => moveAndHover(x, y, id, context.$cursor, $doc),
        delay: timestamp - context.baseline
      };
      context.timer.addAction(action);
    });
  }
}
