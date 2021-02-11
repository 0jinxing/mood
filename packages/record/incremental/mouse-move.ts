import { mirror } from '@mood/snapshot';
import { on, throttle } from '../utils';

import { IncrementalSource } from '../constant';

// repeat => id, x, y, timestamp
export type MousePositions = number[];

export type MouseMoveParam = {
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE;
  positions: MousePositions;
};

export type MousemoveCallback = (param: MouseMoveParam) => void;

export function mouseMove(cb: MousemoveCallback) {
  let positions: MousePositions = [];
  const throttleCb = throttle((isTouch: boolean) => {
    cb({
      positions,
      source: isTouch
        ? IncrementalSource.TOUCH_MOVE
        : IncrementalSource.MOUSE_MOVE
    });

    positions = [];
  }, 500);
  const updatePosition = throttle<MouseEvent | TouchEvent>(event => {
    const { target } = event;
    const { clientX, clientY } =
      event instanceof TouchEvent ? event.changedTouches[0] : event;

    positions.splice(
      positions.length,
      0,
      mirror.getId(target as Node),
      clientX,
      clientY,
      updatePosition.timestamp
    );

    throttleCb(event instanceof TouchEvent);
  }, Math.floor(1000 / 30));

  const handlers = [
    on('mousemove', updatePosition),
    on('touchmove', updatePosition)
  ];
  return () => handlers.forEach(h => h());
}
