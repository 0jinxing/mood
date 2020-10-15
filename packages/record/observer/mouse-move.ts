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

function mouseMoveObserve(cb: MousemoveCb) {
  let positions: MousePosition[] = [];
  let timeBaseline: number = 0;
  const throttleCb = throttle((isTouch: boolean) => {
    const totalOffset = Date.now() - timeBaseline!;
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

      timeBaseline || (timeBaseline = Date.now());
      positions.push({
        x: clientX,
        y: clientY,
        id: mirror.getId(target as Node),
        timeOffset: Date.now() - timeBaseline
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

export default mouseMoveObserve;
