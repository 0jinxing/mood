import { mirror } from '@mood/snapshot';
import { on } from '@mood/utils';
import { SourceType } from '../types';

const actions = <const>['play', 'pause'];

export type SubscribeToMediaInteraction = typeof actions[number];

export type MediaInteractionArg = {
  source: SourceType.MEDIA_INTERACTION;
  action: SubscribeToMediaInteraction;
  id: number;
};

export type SubscribeToMediaInteractionEmit = (arg: MediaInteractionArg) => void;

export function subscribeToMediaInteraction(cb: SubscribeToMediaInteractionEmit) {
  const handler = (act: SubscribeToMediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({ source: SourceType.MEDIA_INTERACTION, id: mirror.getId(target), action: act });
    }
  };

  const unsubscribes = actions.map(k => on(k, handler(k)));

  return () => unsubscribes.forEach(u => u());
}
