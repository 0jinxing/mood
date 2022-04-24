import { serialize, rAttr, mirror, Attrs, SNWithId } from '@mood/snapshot';

import { deepDelete, isAncestorRemoved, isAncestorInSet, isParentRemoved } from '../utils';

import { each } from '@mood/utils';
import { SourceType } from '../types';

export type AttrCursor = { $el: Node; attrs: Attrs };

export type AddedNodeMutation = SNWithId & { pId: number };
export type RemovedNodeMutation = { id: number; pId: number };
export type TextMutation = { id: number; value: string | null };
export type AttrMutation = { id: number; attrs: Attrs };

export type SubscribeToMutationArg = {
  source: SourceType.MUTATION;
  texts: TextMutation[];
  attrs: AttrMutation[];
  removes: RemovedNodeMutation[];
  adds: AddedNodeMutation[];
};

export type SubscribeToMutationEmit = (arg: SubscribeToMutationArg) => void;

const genKey = (id: number, pId: number) => `${id}@${pId}`;

export function subscribeToMutation(cb: SubscribeToMutationEmit) {
  const observer = new MutationObserver(mutations => {
    const attrs: AttrCursor[] = [];
    const texts: Array<{ value: string | null; $el: Node }> = [];
    const removes: RemovedNodeMutation[] = [];
    const adds: AddedNodeMutation[] = [];

    const addedSet = new Set<Node>();
    const removedSet = new Set<Node>();
    const movedSet = new Set<Node>();
    const movedMap = new Map<string, true>();

    const genAdds = ($node: Node, $parent?: Node) => {
      const id = mirror.getId($node);
      if (id) {
        movedSet.add($node);
        const pId = $parent ? mirror.getId($parent) : undefined;
        if (pId) {
          movedMap.set(genKey(id, pId), true);
        }
      } else {
        addedSet.add($node);
        removedSet.delete($node);
      }
      each($node.childNodes, $child => genAdds($child));
    };

    mutations.forEach(({ type, target, oldValue, addedNodes, removedNodes, attributeName }) => {
      // characterData
      if (type === 'characterData') {
        const value = target.textContent;

        if (value === oldValue) return;

        texts.push({ value, $el: target });
      }
      // attributes
      else if (type === 'attributes') {
        const attrName = attributeName || '';

        const value = (target as HTMLElement).getAttribute(attrName);

        if (oldValue === value) return;

        let current = attrs.find(attr => attr.$el === target);
        if (!current) {
          current = { $el: target, attrs: {} };
          attrs.push(current);
        }
        current.attrs[attrName] = rAttr(attrName, value || '');
      }
      // childList
      else if (type === 'childList') {
        each(addedNodes, $node => genAdds($node, target));

        each(removedNodes, $node => {
          const id = mirror.getId($node);
          const pId = mirror.getId(target);

          const movedKey = genKey(id, pId);

          if (addedSet.has($node)) {
            deepDelete(addedSet, $node);
            removedSet.add($node);
          } else if (addedSet.has(target) && !id) {
            /**
             * If target was newly added and removed child node was
             * not serialized, it means the child node has been removed
             * before callback fired, so we can ignore it because
             * newly added node will be serialized without child nodes.
             */
          } else if (isAncestorRemoved(target)) {
            /**
             * If parent id was not in the mirror map any more, it
             * means the parent node has already been removed. So
             * the node is also removed which we do not need to track
             * and replay.
             */
          } else if (movedSet.has($node) && movedMap.get(movedKey)) {
            deepDelete(movedSet, $node);
            movedMap.delete(movedKey);
          } else {
            removes.push({ pId, id });
          }
          mirror.remove($node);
        });
      }
    });

    const addQueue: Node[] = [];

    const pushAdd = ($node: Node) => {
      const pId = $node.parentNode ? mirror.getId($node.parentNode) : undefined;

      const nId = $node.nextSibling ? mirror.getId($node.nextSibling) : undefined;

      if (!pId || nId === 0) {
        addQueue.push($node);
        return;
      }

      each(serialize($node, document), item => adds.push({ pId, nId, ...item }));
    };

    movedSet.forEach($node => pushAdd($node));

    for (const $node of addedSet) {
      if (!isAncestorInSet(removedSet, $node) && !isParentRemoved(removes, $node)) {
        pushAdd($node);
      } else if (isAncestorInSet(movedSet, $node)) {
        pushAdd($node);
      } else {
        removedSet.add($node);
      }
    }

    while (addQueue.length) {
      if (addQueue.every(({ parentNode }) => parentNode && !mirror.getId(parentNode))) {
        /**
         * If all nodes in queue could not find a serialized parent,
         * it may be a bug or corner case. We need to escape the
         * dead while loop at once.
         */
        break;
      }
      pushAdd(addQueue.shift()!);
    }

    const arg: SubscribeToMutationArg = {
      source: SourceType.MUTATION,

      texts: texts
        .map(text => ({
          id: mirror.getId(text.$el),
          value: text.value
        }))
        .filter(text => mirror.has(text.id)),

      attrs: attrs.map(attr => ({
        id: mirror.getId(attr.$el),
        attrs: attr.attrs
      })),

      removes,
      adds
    };

    if (!arg.texts.length && !arg.attrs.length && !arg.removes.length && !arg.adds.length) {
      return;
    }
    cb(arg);
  });

  observer.observe(document, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true
  });

  return () => {
    observer.disconnect();
  };
}
