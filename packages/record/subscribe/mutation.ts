import {
  serialize,
  abs,
  mirror,
  Attributes,
  SNWithId
} from '@mood/snapshot';

import {
  isAncestorRemoved,
  deepDelete,
  isAncestorInSet,
  isParentRemoved
} from '../utils';

import { IncrementalSource } from '../constant';

export type AttrCursor = {
  $el: Node;
  attributes: Attributes;
};

export type AddedNodeMutation = SNWithId & { parentId: number };

export type RemovedNodeMutation = {
  id: number;
  parentId: number;
};

export type TextMutation = {
  id: number;
  value: string | null;
};

export type AttrMutation = {
  id: number;
  attributes: Attributes;
};

export type MutationParam = {
  source: IncrementalSource.MUTATION;
  texts: TextMutation[];
  attributes: AttrMutation[];
  removes: RemovedNodeMutation[];
  adds: AddedNodeMutation[];
};

export type MutationCallback = (param: MutationParam) => void;

const genKey = (id: number, parentId: number) => `${id}@${parentId}`;

export function mutation(cb: MutationCallback) {
  const observer = new MutationObserver(mutations => {
    const attrs: AttrCursor[] = [];
    const texts: Array<{ value: string; $el: Node }> = [];
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
        const parentId = $parent ? mirror.getId($parent) : undefined;
        if (parentId) {
          movedMap.set(genKey(id, parentId), true);
        }
      } else {
        addedSet.add($node);
        removedSet.delete($node);
      }
      $node.childNodes.forEach($childNode => genAdds($childNode));
    };

    mutations.forEach(
      ({ type, target, oldValue, addedNodes, removedNodes, attributeName }) => {
        // characterData
        if (type === 'characterData') {
          const value = target.textContent!;

          if (value === oldValue) return;

          texts.push({ value, $el: target });
        }
        // attributes
        else if (type === 'attributes') {
          const value = (target as HTMLElement).getAttribute(attributeName!);

          if (oldValue === value) return;

          let current = attrs.find(attr => attr.$el === target);
          if (!current) {
            current = { $el: target, attributes: {} };
            attrs.push(current);
          }
          current.attributes[attributeName!] = abs(attributeName!, value!);
        }
        // childList
        else if (type === 'childList') {
          addedNodes.forEach($node => genAdds($node, target));
          removedNodes.forEach($node => {
            const id = mirror.getId($node);
            const parentId = mirror.getId(target);

            const movedKey = genKey(id, parentId);

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
              removes.push({ parentId, id });
            }
            mirror.remove($node);
          });
        }
      }
    );

    const addQueue: Node[] = [];

    const pushAdd = ($node: Node) => {
      const parentId = $node.parentNode
        ? mirror.getId($node.parentNode)
        : undefined;

      const nextId = $node.nextSibling
        ? mirror.getId($node.nextSibling)
        : undefined;

      if (!parentId || nextId === 0) {
        addQueue.push($node);
        return;
      }

      const sn = serialize($node, document);

      if (Array.isArray(sn)) {
        sn.forEach(item => {
          adds.push({ parentId: parentId, nextId: nextId, ...item });
        });
      } else if (sn) {
        adds.push({ parentId: parentId, nextId: nextId, ...sn });
      }
    };

    movedSet.forEach($node => pushAdd($node));

    for (const $node of addedSet) {
      if (
        !isAncestorInSet(removedSet, $node) &&
        !isParentRemoved(removes, $node)
      ) {
        pushAdd($node);
      } else if (isAncestorInSet(movedSet, $node)) {
        pushAdd($node);
      } else {
        removedSet.add($node);
      }
    }

    while (addQueue.length) {
      if (
        addQueue.every(
          ({ parentNode }) => parentNode && !mirror.getId(parentNode)
        )
      ) {
        /**
         * If all nodes in queue could not find a serialized parent,
         * it may be a bug or corner case. We need to escape the
         * dead while loop at once.
         */
        break;
      }
      pushAdd(addQueue.shift()!);
    }

    const payload: MutationParam = {
      source: IncrementalSource.MUTATION,

      texts: texts
        .map(text => ({
          id: mirror.getId(text.$el),
          value: text.value
        }))
        .filter(text => mirror.has(text.id)),

      attributes: attrs.map(attr => ({
        id: mirror.getId(attr.$el),
        attributes: attr.attributes
      })),

      removes,
      adds
    };

    if (
      !payload.texts.length &&
      !payload.attributes.length &&
      !payload.removes.length &&
      !payload.adds.length
    ) {
      return;
    }
    cb(payload);
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
