import { mirror } from '@mood/snapshot';
import { on } from '../utils';
import { IncrementalSource } from '../constant';

const ACTIONS = <const>[
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

export type MouseInteraction = typeof ACTIONS[number];

export type MouseInteractionParam = {
  source: IncrementalSource.MOUSE_INTERACTION;
  action: MouseInteraction;
  id: number;
  x: number;
  y: number;
};

export type MouseInteractionCallback = (param: MouseInteractionParam) => void;

export function mouseInteraction(cb: MouseInteractionCallback) {
  const handlers: VoidFunction[] = [];

  const getHandler = (action: MouseInteraction) => {
    return (event: MouseEvent | TouchEvent) => {
      const id = mirror.getId(event.target as Node);

      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;

      cb({
        source: IncrementalSource.MOUSE_INTERACTION,
        action,
        id,
        x: clientX,
        y: clientY
      });
    };
  };

  ACTIONS.forEach((action: MouseInteraction) => {
    const handler = getHandler(action);
    handlers.push(on(action, handler));
  });
  return () => {
    handlers.forEach(h => h());
  };
}
