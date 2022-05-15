import { serialize, rAttr, mirror, Attrs, SNWithId, getNextSibling } from '@mood/snapshot';
import { each } from '@mood/utils';
import { SourceType } from '../types';

export type AddedNodeMutation = SNWithId & { pId: number };
export type RemovedNodeMutation = { id: number };
export type TextMutation = { id: number; value: string | null };
export type AttrMutation = { id: number; record: Attrs };

export type SubscribeToMutationArg = {
  source: SourceType.MUTATION;
  texts: TextMutation[];
  attrs: AttrMutation[];
  removes: RemovedNodeMutation[];
  adds: AddedNodeMutation[];
};

export type SubscribeToMutationEmit = (arg: SubscribeToMutationArg) => void;

function deepDelete(set: Set<Node>, $node: Node) {
  set.delete($node);
  each($node.childNodes, $node => deepDelete(set, $node));
}

export function subscribeToMutation(cb: SubscribeToMutationEmit) {
  const observer = new MutationObserver(mutations => {
    const adds: AddedNodeMutation[] = [];
    const removes: RemovedNodeMutation[] = [];
    const attrs: AttrMutation[] = [];
    const texts: TextMutation[] = [];

    const set = new Set<Node>();

    const visitAddedNodes = ($node: Node) => {
      set.add($node);
      each($node.childNodes, $child => visitAddedNodes($child));
    };

    const visitRemovedNodes = ($node: Node) => {
      const id = mirror.getId($node);

      mirror.remove($node);

      if (set.has($node)) deepDelete(set, $node);
      else removes.push({ id });
    };

    mutations.forEach(({ type, target, addedNodes, removedNodes, attributeName }) => {
      // childList
      if (type === 'childList') {
        each(addedNodes, visitAddedNodes);
        each(removedNodes, visitRemovedNodes);
      }
      // attributes
      else if (type === 'attributes') {
        const attrName = attributeName || '';

        const value = (<HTMLElement>target).getAttribute(attrName);

        let current = attrs.find(attr => attr.id === mirror.getId(target));

        if (!current) {
          current = { id: mirror.getId(target), record: {} };
          attrs.push(current);
        }
        current.record[attrName] = rAttr(attrName, value || '');
      }
      // characterData
      else if (type === 'characterData') {
        const value = target.textContent;

        texts.push({ id: mirror.getId(target), value });
      }
    });

    const queue: Node[] = [];

    const pushQueue = ($node: Node) => {
      const pId = $node.parentNode ? mirror.getId($node.parentNode) : undefined;

      const nextSibling = getNextSibling($node);
      const nId = nextSibling ? mirror.getId(nextSibling) : undefined;

      if (!pId || nId === 0) {
        queue.push($node);
        return;
      }

      each(serialize($node, document), item => adds.push({ pId, nId, ...item }));
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
    attributeOldValue: false,
    characterData: true,
    characterDataOldValue: false,
    childList: true,
    subtree: true
  });

  return () => observer.disconnect();
}
