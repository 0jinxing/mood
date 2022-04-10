import { mirror } from '@mood/snapshot';
import { on } from '../utils';
import { IncSource } from '../constant';

export type MediaInteraction = 'play' | 'pause';

export type MediaInteractionParam = {
  source: IncSource.MEDIA_INTERACTION;
  action: MediaInteraction;
  id: number;
};

export type MediaInteractionCallback = (param: MediaInteractionParam) => void;

export function subscribeMediaInteraction(cb: MediaInteractionCallback) {
  const handler = (act: MediaInteraction) => (event: Event) => {
    const { target } = event;
    if (target) {
      cb({
        source: IncSource.MEDIA_INTERACTION,
        id: mirror.getId(target),
        action: act
      });
    }
  };
  const handlers = [on('play', handler('play')), on('pause', handler('pause'))];
  return () => {
    handlers.forEach(h => h());
  };
}
