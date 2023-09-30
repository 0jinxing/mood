import { mirror } from '@mood/snapshot';
import { each, on } from '@mood/utils';
import { SourceTypes } from '../types';

const actions = <const>['play', 'pause'];

export type SubscribeToMediaInteraction = typeof actions[number];

export type SubscribeToMediaInteractionArg = {
  source: SourceTypes.MEDIA_INTERACTION;
  action: SubscribeToMediaInteraction;
  id: number;
};

export type SubscribeToMediaInteractionEmit = (arg: SubscribeToMediaInteractionArg) => void;

export function subscribeToMediaInteraction(cb: SubscribeToMediaInteractionEmit, doc?: Document) {
  const handler = (act: SubscribeToMediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({ source: SourceTypes.MEDIA_INTERACTION, id: mirror.getId(target), action: act });
    }
  };

  const unsubscribes = actions.map(k => on(doc || document, k, handler(k)));

  return () => each(unsubscribes, u => u());
}
