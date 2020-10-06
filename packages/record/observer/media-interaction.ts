import { on } from '../utils';
import { TNode, mirror } from '@mood/snapshot';

export type MediaInteractions = 'play' | 'pause';

export type MediaInteractionParam = {
  id: number;
  type: MediaInteractions;
};

export type MediaInteractionCallback = (param: MediaInteractionParam) => void;

function initMediaInteractionObserver(cb: MediaInteractionCallback) {
  const handler = (type: MediaInteractions) => (event: Event) => {
    const { target } = event;
    target && cb({ type, id: mirror.getId(target as TNode) });
  };
  const handlers = [on('play', handler('play')), on('pause', handler('pause'))];
  return () => {
    handlers.forEach(h => h());
  };
}

export default initMediaInteractionObserver;
