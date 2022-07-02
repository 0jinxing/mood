import { serialize, resolveAttrUrl, mirror, Attrs, SNWithId, next } from '@mood/snapshot';
import { SourceType } from '../types';

export type AddedNodeMutation = SNWithId & { pId: number };
export type RemovedNodeMutation = { id: number };
export type TextMutation = { id: number; value: string | null };
export type AttrMutation = { id: number; record: Attrs };

export type SubscribeToMutationArg = {
  source: SourceType.MUTATION;
  texts?: TextMutation[];
  attrs?: AttrMutation[];
  removes?: RemovedNodeMutation[];
  adds?: AddedNodeMutation[];
};

export type SubscribeToMutationEmit = (arg: SubscribeToMutationArg) => void;

function deepDelete(set: Set<Node>, $node: Node) {
  set.delete($node);
  $node.childNodes.forEach($node => deepDelete(set, $node));
}

export function subscribeToMutation(cb: SubscribeToMutationEmit) {
  const observer = new MutationObserver(mutations => {
    let adds: AddedNodeMutation[] | undefined;
    let removes: RemovedNodeMutation[] | undefined;
    let attrs: AttrMutation[] | undefined;
    let texts: TextMutation[] | undefined;

    const set = new Set<Node>();

    const visitAddedNodes = ($node: Node) => {
      set.add($node);

      Array.from($node.childNodes)
        .reverse()
        .forEach($child => visitAddedNodes($child));
    };

    const visitRemovedNodes = ($node: Node) => {
      const id = mirror.getId($node);

      mirror.remove($node);

      if (set.has($node)) {
        deepDelete(set, $node);
      } else {
        removes = removes || [];
        removes.push({ id });
      }
    };

    mutations.forEach(({ type, target, addedNodes, removedNodes, attributeName }) => {
      if (type === 'childList') {
        addedNodes.forEach(visitAddedNodes);
        removedNodes.forEach(visitRemovedNodes);
      } else if (type === 'attributes') {
        const name = attributeName || '';
        const value = (<HTMLElement>target).getAttribute(name);

        let current = attrs?.find(attr => attr.id === mirror.getId(target));

        if (!current) {
          current = { id: mirror.getId(target), record: {} };

          attrs = attrs || [];
          attrs.push(current);
        }
        current.record[name] = typeof value === 'string' ? resolveAttrUrl(name, value) : null;
      } else if (type === 'characterData') {
        const value = target.textContent;

        texts = texts || [];
        texts.push({ id: mirror.getId(target), value });
      }
    });

    const queue: Node[] = [];

    const pushQueue = ($node: Node) => {
      const pId = $node.parentNode ? mirror.getId($node.parentNode) : undefined;
      const $next = next($node);

      const nId = $next ? mirror.getId($next) : undefined;

      if (!pId || nId === 0) {
        queue.push($node);
        return;
      }

      serialize($node, document).forEach(item => {
        adds = adds || [];
        adds.push({ pId, nId, ...item });
      });
    };

    set.forEach(pushQueue);

    while (queue.length) {
      /**
       * If all nodes in queue could not find a serialized parent,
       * it may be a bug or corner case. We need to escape the
       * dead while loop at once.
       */
      if (queue.every(({ parentNode }) => parentNode && !mirror.getId(parentNode))) break;

      pushQueue(queue.shift()!);
    }

    cb({ source: SourceType.MUTATION, texts, attrs, removes, adds });
  });

  observer.observe(document, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,

    characterDataOldValue: false,
    attributeOldValue: false
  });

  return () => observer.disconnect();
}
