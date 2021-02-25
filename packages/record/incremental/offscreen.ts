import { mirror, SNWithId, serializeWithId } from '@mood/snapshot';
import { getAddition } from '@mood/snapshot/utils/addition';
import { IncrementalSource } from '../constant';
import { MethodKeys } from '../types';
import { hookMethod } from '../utils';

export type OffscreenParam = {
  source: IncrementalSource.OFFSCREEN;
  sn: SNWithId;
};

export type OffscreenCallback = (param: OffscreenParam) => void;

export function offscreen(cb: OffscreenCallback) {
  const unsubscribe = hookMethod(
    Document.prototype,
    'createElement',
    function (result: HTMLElement) {
      if (getAddition(result)) return;

      const node = serializeWithId(result, document);

      if (node && getAddition(result)) {
        mirror.idNodeMap[node.id] = result;
        cb({ source: IncrementalSource.OFFSCREEN, sn: node });
      }
    }
  );

  return unsubscribe;
}

type a = MethodKeys<Document>;
