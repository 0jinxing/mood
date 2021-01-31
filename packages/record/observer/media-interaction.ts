import { on } from '../utils';
import { TNode, mirror } from '@mood/snapshot';
import { IncrementalSource } from '../constant';

export type MediaInteractions = 'play' | 'pause';

export type MediaInteractionData = {
  source: IncrementalSource.MEDIA_INTERACTION;
  act: MediaInteractions;
  id: number;
};

export type MediaInteractionCb = (param: MediaInteractionData) => void;

export function mediaInteractionObserve(cb: MediaInteractionCb) {
  const handler = (act: MediaInteractions) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({
        source: IncrementalSource.MEDIA_INTERACTION,
        id: mirror.getId(target as TNode),
        act
      });
    }
  };
  const handlers = [on('play', handler('play')), on('pause', handler('pause'))];
  return () => {
    handlers.forEach(h => h());
  };
}
