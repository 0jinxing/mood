import { mirror } from '@mood/snapshot';
import { each, on } from '@mood/utils';
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

export type SubscribeToMouseInteractionEmit = (arg: SubscribeToMouseInteractionArg) => void;

export function subscribeToMouseInteraction(cb: SubscribeToMouseInteractionEmit) {
  const getHandler = (action: SubscribeToMouseInteraction) => {
    return (event: MouseEvent | TouchEvent) => {
      const id = mirror.getId(event.target as Node);

      const { clientX, clientY } = event instanceof TouchEvent ? event.changedTouches[0] : event;

      cb({
        source: SourceType.MOUSE_INTERACTION,
        action,
        id,
        x: clientX,
        y: clientY
      });
    };
  };

  const unsubscribes = actions.map(action => {
    const handler = getHandler(action);
    return on(action, handler);
  });

  return () => each(unsubscribes, u => u() && false);
}
