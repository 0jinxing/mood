import { MouseMoveEmitArg } from '@mood/record';
import { each } from '@mood/utils';
import { EmitHandler } from '../types';
import { chunk } from '../utils/chunk';
import { moveAndHover } from '../utils/hover';

export const handleMouseMoveEmit: EmitHandler<MouseMoveEmitArg> = (
  event,
  { $iframe, $cursor, mirror, scheduler, baseline },
  sync
) => {
  const $doc = $iframe.contentDocument!;

  if (sync) {
    const [id, x, y] = event.ps.slice(event.ps.length - 4);
    moveAndHover(x, y, id, mirror, $cursor, $doc);
  } else {
    each(chunk(event.ps, 4), ([id, x, y, timestamp]) => {
      scheduler.push({
        exec: () => moveAndHover(x, y, id, mirror, $cursor, $doc),
        delay: timestamp - baseline
      });
    });
  }
};
