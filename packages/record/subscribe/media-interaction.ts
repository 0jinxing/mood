import { mirror } from '@mood/snapshot';
import { SourceType } from '../types';
import { on } from '../utils';

const actions = <const>['play', 'pause'];

export type SubscribeToMediaInteraction = typeof actions[number];

export type MediaInteractionArg = {
  source: SourceType.MEDIA_INTERACTION;
  action: SubscribeToMediaInteraction;
  id: number;
};

export type SubscribeToMediaInteractionEmit = (
  arg: MediaInteractionArg
) => void;

export function subscribeToMediaInteraction(
  cb: SubscribeToMediaInteractionEmit
) {
  const handler = (act: SubscribeToMediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({
        source: SourceType.MEDIA_INTERACTION,
        id: mirror.getId(target),
        action: act
      });
    }
  };
  const handlers = actions.map(k => on(k, handler(k)));
  return () => {
    handlers.forEach(h => h());
  };
}
