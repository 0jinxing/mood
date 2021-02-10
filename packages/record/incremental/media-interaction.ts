import { ExtNode, mirror } from '@mood/snapshot';
import { on } from '../utils';
import { IncrementalSource } from '../constant';

export type MediaInteraction = 'play' | 'pause';

export type MediaInteractionData = {
  source: IncrementalSource.MEDIA_INTERACTION;
  action: MediaInteraction;
  id: number;
};

export type MediaInteractionCb = (param: MediaInteractionData) => void;

export function mediaInteraction(cb: MediaInteractionCb) {
  const handler = (act: MediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({
        source: IncrementalSource.MEDIA_INTERACTION,
        id: mirror.getId(target as ExtNode),
        action: act
      });
    }
  };
  const handlers = [on('play', handler('play')), on('pause', handler('pause'))];
  return () => {
    handlers.forEach(h => h());
  };
}
