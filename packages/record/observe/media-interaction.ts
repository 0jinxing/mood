import { each, on } from '@mood/utils';
import { ObserveHandler, SourceTypes } from '../types';

const ACTIONS = <const>['play', 'pause'];

export type SubscribeToMediaInteraction = (typeof ACTIONS)[number];

export type MediaInteractionEmitArg = {
  source: SourceTypes.MEDIA_INTERACTION;
  action: SubscribeToMediaInteraction;
  id: number;
};

export const observeMediaInteraction: ObserveHandler<MediaInteractionEmitArg> = (
  cb,
  { doc, mirror }
) => {
  const handler = (act: SubscribeToMediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({ source: SourceTypes.MEDIA_INTERACTION, id: mirror.getId(target), action: act });
    }
  };

  const unsubscribes = ACTIONS.map(k => on(doc || document, k, handler(k)));

  return () => each(unsubscribes, u => u());
};
