import { mirror } from '@mood/snapshot';
import { on, throttle } from '../utils';

import { IncrementalSource } from '../constant';

export type MousePosition = {
  id: number;
  x: number;
  y: number;
  timeOffset: number;
};

export type MouseMoveData = {
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE;
  positions: MousePosition[];
};

export type MousemoveCb = (param: MouseMoveData) => void;

export function mouseMove(cb: MousemoveCb) {
  let positions: MousePosition[] = [];
  const throttleCb = throttle((isTouch: boolean) => {
    const totalOffset = Date.now();
    cb({
      positions: positions.map(({ timeOffset, ...rest }) => ({
        ...rest,
        timeOffset: timeOffset - totalOffset
      })),
      source: isTouch
        ? IncrementalSource.TOUCH_MOVE
        : IncrementalSource.MOUSE_MOVE
    });

    positions = [];
  }, 500);
  const updatePosition = throttle<MouseEvent | TouchEvent>(
    event => {
      const { target } = event;
      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;

      positions.push({
        x: clientX,
        y: clientY,
        id: mirror.getId(target as Node),
        timeOffset: Date.now()
      });
      throttleCb(event instanceof TouchEvent);
    },
    Math.floor(1000 / 30),
    { trailing: false }
  );
  const handlers = [
    on('mousemove', updatePosition),
    on('touchmove', updatePosition)
  ];
  return () => handlers.forEach(h => h());
}
