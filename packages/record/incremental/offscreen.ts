import { mirror, SerializedNodeWithId, serializeWithId } from '@mood/snapshot';
import { getExtraData } from 'packages/snapshot/utils/extra';
import { IncrementalSource } from '../constant';
import { hookFunc } from '../utils';

export type OffscreenParam = {
  source: IncrementalSource.OFFSCREEN;
  sn: SerializedNodeWithId;
};

export type OffscreenCallback = (param: OffscreenParam) => void;

export function offscreen(cb: OffscreenCallback) {
  const unsubscribe = hookFunc(
    Document.prototype,
    'createElement',
    function (result: HTMLElement) {
      if (getExtraData(result)) return;

      const node = serializeWithId(result, document);

      if (node && getExtraData(result)) {
        mirror.idNodeMap[node.id] = result;
        cb({ source: IncrementalSource.OFFSCREEN, sn: node });
      }
    }
  );

  return unsubscribe;
}
