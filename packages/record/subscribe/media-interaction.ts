import { mirror } from '@mood/snapshot';
import { each, on } from '@mood/utils';
import { SourceTypes } from '../types';

const actions = <const>['play', 'pause'];

export type SubscribeToMediaInteraction = typeof actions[number];

export type MediaInteractionArg = {
  source: SourceTypes.MEDIA_INTERACTION;
  action: SubscribeToMediaInteraction;
  id: number;
};

export type SubscribeToMediaInteractionEmit = (arg: MediaInteractionArg) => void;

export function subscribeToMediaInteraction(cb: SubscribeToMediaInteractionEmit, doc?: Document) {
  const handler = (act: SubscribeToMediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({ source: SourceTypes.MEDIA_INTERACTION, id: mirror.getId(target), action: act });
    }
  };

  const unsubscribes = actions.map(k => on(k, handler(k), doc));

  return () => each(unsubscribes, u => u());
}
