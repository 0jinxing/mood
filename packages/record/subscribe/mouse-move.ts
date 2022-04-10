import { mirror } from '@mood/snapshot';
import { on, throttle } from '../utils';

import { IncSource } from '../constant';

export type MousePositions = number[];

export type MouseMoveParam = {
  source: IncSource.MOUSE_MOVE | IncSource.TOUCH_MOVE;
  positions: MousePositions;
};

export type MousemoveCallback = (param: MouseMoveParam) => void;

export function subscribeMouseMove(cb: MousemoveCallback) {
  let positions: MousePositions = [];
  const throttleCb = throttle((touch: boolean) => {
    cb({
      positions,
      source: touch
        ? IncSource.TOUCH_MOVE
        : IncSource.MOUSE_MOVE
    });

    positions = [];
  }, 500);
  const updatePosition = throttle<MouseEvent | TouchEvent>(event => {
    const { target } = event;
    const { clientX, clientY } =
      event instanceof TouchEvent ? event.changedTouches[0] : event;

    positions.push(
      mirror.getId(target as Node),
      clientX,
      clientY,
      updatePosition.timestamp
    );

    throttleCb(event instanceof TouchEvent);
  }, 30);

  const handlers = [
    on('mousemove', updatePosition),
    on('touchmove', updatePosition)
  ];
  return () => handlers.forEach(h => h());
}
