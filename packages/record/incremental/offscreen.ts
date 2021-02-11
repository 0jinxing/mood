import {
  mirror,
  SerializedNodeWithId,
  serializeWithId,
  isExtNode
} from '@mood/snapshot';
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
    function (result: HTMLElement, ...args: unknown[]) {
      if (isExtNode(result)) return;

      const node = serializeWithId(result, document);

      if (node && isExtNode(result)) {
        mirror.idNodeMap[node.id] = result;
        cb({ source: IncrementalSource.OFFSCREEN, sn: node });
      }
    }
  );

  return unsubscribe;
}
