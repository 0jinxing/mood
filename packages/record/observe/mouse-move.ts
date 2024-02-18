import { each, on, throttle } from '@mood/utils';
import { ObserveFunc, ST } from '../types';

export type MousePositions = number[];

export type MouseMoveEmitArg = {
  source: ST.MOUSE_MOVE | ST.TOUCH_MOVE;
  ps: MousePositions;
};

export const observeMouseMove: ObserveFunc<MouseMoveEmitArg> = (cb, { mirror }) => {
  let ps: MousePositions = [];
  const throttleCb = throttle((touch: boolean) => {
    cb({ ps, source: touch ? ST.TOUCH_MOVE : ST.MOUSE_MOVE });

    ps = [];
  }, 500);
  const updatePosition = throttle<MouseEvent | TouchEvent>(event => {
    const { target } = event;
    const { clientX, clientY } = event instanceof TouchEvent ? event.changedTouches[0] : event;

    ps.push(mirror.getId(target as Node), clientX, clientY, updatePosition.timestamp);

    throttleCb(event instanceof TouchEvent);
  }, 30);

  const unsubscribes = [
    on(document, 'mousemove', updatePosition),
    on(document, 'touchmove', updatePosition)
  ];

  return () => each(unsubscribes, u => u());
};
