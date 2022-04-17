import { mirror } from '@mood/snapshot';
import { on } from '@mood/utils';
import { SourceType } from '../types';

const actions = <const>[
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

export type SubscribeToMouseInteraction = typeof actions[number];

export type SubscribeToMouseInteractionArg = {
  source: SourceType.MOUSE_INTERACTION;
  action: SubscribeToMouseInteraction;
  id: number;
  x: number;
  y: number;
};

export type SubscribeToMouseInteractionEmit = (
  arg: SubscribeToMouseInteractionArg
) => void;

export function subscribeToMouseInteraction(
  cb: SubscribeToMouseInteractionEmit
) {
  const handlers: Function[] = [];

  const getHandler = (action: SubscribeToMouseInteraction) => {
    return (event: MouseEvent | TouchEvent) => {
      const id = mirror.getId(event.target as Node);

      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;

      cb({
        source: SourceType.MOUSE_INTERACTION,
        action,
        id,
        x: clientX,
        y: clientY
      });
    };
  };

  actions.forEach((action: SubscribeToMouseInteraction) => {
    const handler = getHandler(action);
    handlers.push(on(action, handler));
  });
  return () => {
    handlers.forEach(h => h());
  };
}
