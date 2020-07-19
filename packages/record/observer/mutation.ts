import {
  MutationCallBack,
  AttrCursor,
  RemovedNodeMutation,
  AddedNodeMutation,
  TNode,
  mirror,
} from "@traps/common";
import { deepDelete, isParentRemoved, isAncestorInSet } from "../collection";
import { isAncestorRemoved } from "../utils";
import { serializeWithId, transformAttr } from "@traps/snapshot";

const genKey = (id: number, parentId: number) => `${id}@${parentId}`;

function initMutationObserver(cb: MutationCallBack) {
  const observer = new MutationObserver((mutations) => {
    const attrs: AttrCursor[] = [];
    const texts: Array<{ value: string; $el: Node }> = [];
    const removes: RemovedNodeMutation[] = [];
    const adds: AddedNodeMutation[] = [];

    const addedSet = new Set<Node>();
    const removedSet = new Set<Node>();
    const movedSet = new Set<Node>();
    const movedMap = new Map<string, true>();

    const genAdds = ($node: Node | TNode, $parent?: Node | TNode) => {
      if ("__sn" in $node) {
        movedSet.add($node);
        const parentId = $parent ? mirror.getId($parent) : undefined;
        if (parentId) {
          movedMap.set(genKey($node.__sn.id, parentId), true);
        }
      } else {
        addedSet.add($node);
        removedSet.delete($node);
      }
      $node.childNodes.forEach(($childNode) => genAdds($childNode));
    };

    mutations.forEach(
      ({ type, target, oldValue, addedNodes, removedNodes, attributeName }) => {
        // characterData
        if (type === "characterData") {
          const value = target.textContent;

          if (value === oldValue) return;

          texts.push({ value: value!, $el: target });
        }
        // attributes
        else if (type === "attributes") {
          const value = (target as HTMLElement).getAttribute(attributeName!);

          if (oldValue === value) return;

          let current = attrs.find((a) => a.$el === target);
          if (!current) {
            current = { $el: target, attributes: {} };
            attrs.push(current);
          }
          current.attributes[attributeName!] = transformAttr(
            attributeName!,
            value!
          );
        }
        // childList
        else if (type === "childList") {
          addedNodes.forEach(($node) => genAdds($node, target));
          removedNodes.forEach(($node) => {
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
            } else if (isAncestorRemoved(target as TNode)) {
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
            mirror.remove($node as TNode);
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

      adds.push({
        parentId,
        nextId,
        node: serializeWithId($node, document)!,
      });
    };

    movedSet.forEach(($node) => pushAdd($node));

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
          ($node) => !mirror.getId(($node.parentNode as Node) as TNode)
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

    const payload = {
      texts: texts
        .map((text) => ({
          id: mirror.getId(text.$el as TNode),
          value: text.value,
        }))
        .filter((text) => mirror.has(text.id)),
      attributes: attrs.map((attr) => ({
        id: mirror.getId(attr.$el as TNode),
        attributes: attr.attributes,
      })),
      removes,
      adds,
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
    subtree: true,
  });
  return observer;
}

export default initMutationObserver;
