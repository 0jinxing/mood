import { mirror } from '@mood/snapshot';
import { each, on, throttle } from '@mood/utils';
import { SourceType } from '../types';

export type MousePositions = number[];

export type SubscribeToMouseMoveArg = {
  source: SourceType.MOUSE_MOVE | SourceType.TOUCH_MOVE;
  ps: MousePositions;
};

export type SubscribeToMousemoveEmit = (arg: SubscribeToMouseMoveArg) => void;

export function subscribeToMouseMove(cb: SubscribeToMousemoveEmit) {
  let ps: MousePositions = [];

  const throttleCb = throttle((touch: boolean) => {
    cb({ ps, source: touch ? SourceType.TOUCH_MOVE : SourceType.MOUSE_MOVE });

    ps = [];
  }, 500);

  const updatePosition = throttle<MouseEvent | TouchEvent>(event => {
    const { target } = event;
    const { clientX, clientY } = event instanceof TouchEvent ? event.changedTouches[0] : event;

    ps.push(mirror.getId(target as Node), clientX, clientY, updatePosition.timestamp);

    throttleCb(event instanceof TouchEvent);
  }, 30);

  const unsubscribes = [on('mousemove', updatePosition), on('touchmove', updatePosition)];

  return () => each(unsubscribes, u => u());
}
