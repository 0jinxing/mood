import { mirror } from '@mood/snapshot';
import { on } from '../utils';
import { IncrementalSource } from '../constant';

export type MouseInteraction =
  | 'mouseup'
  | 'mousedown'
  | 'click'
  | 'contexemenu'
  | 'dbclick'
  | 'focus'
  | 'blur'
  | 'touchstart'
  | 'touchend';

const ACTS: MouseInteraction[] = [
  'mouseup',
  'mousedown',
  'click',
  'contexemenu',
  'dbclick',
  'focus',
  'blur',
  'touchstart',
  'touchend'
];

export type MouseInteractionData = {
  source: IncrementalSource.MOUSE_INTERACTION;
  action: MouseInteraction;
  id: number;
  x: number;
  y: number;
};

export type MouseInteractionCb = (param: MouseInteractionData) => void;

export function mouseInteraction(cb: MouseInteractionCb) {
  const handlers: VoidFunction[] = [];

  const getHandler = (act: MouseInteraction) => {
    return (event: MouseEvent | TouchEvent) => {
      const id = mirror.getId(event.target as Node);

      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;

      cb({
        source: IncrementalSource.MOUSE_INTERACTION,
        action: act,
        id,
        x: clientX,
        y: clientY
      });
    };
  };

  ACTS.forEach((act: MouseInteraction) => {
    const handler = getHandler(act);
    handlers.push(on(act, handler));
  });
  return () => {
    handlers.forEach(h => h());
  };
}
