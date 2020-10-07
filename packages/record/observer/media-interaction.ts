import { on } from '../utils';
import { TNode, mirror } from '@mood/snapshot';

export type MediaInteractions = 'play' | 'pause';

export type MediaInteractionCbParam = {
  id: number;
  type: MediaInteractions;
};

export type MediaInteractionCb = (param: MediaInteractionCbParam) => void;

function mediaInteractionObserve(cb: MediaInteractionCb) {
  const handler = (type: MediaInteractions) => (event: Event) => {
    const { target } = event;
    target && cb({ type, id: mirror.getId(target as TNode) });
  };
  const handlers = [on('play', handler('play')), on('pause', handler('pause'))];
  return () => {
    handlers.forEach(h => h());
  };
}

export default mediaInteractionObserve;
