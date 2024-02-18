import { each, on } from '@mood/utils';
import { ObserveFunc, ST } from '../types';

const ACTIONS = <const>['play', 'pause'];

export type SubscribeToMediaInteraction = (typeof ACTIONS)[number];

export type MediaInteractionEmitArg = {
  source: ST.MEDIA_INTERACTION;
  action: SubscribeToMediaInteraction;
  id: number;
};

export const observeMediaInteraction: ObserveFunc<MediaInteractionEmitArg> = (
  cb,
  { doc, mirror }
) => {
  const handler = (act: SubscribeToMediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({ source: ST.MEDIA_INTERACTION, id: mirror.getId(target), action: act });
    }
  };

  const unsubscribes = ACTIONS.map(k => on(doc || document, k, handler(k)));

  return () => each(unsubscribes, u => u());
};
