import { Mirror } from '@mood/snapshot';
import { each } from '@mood/utils';

export function deepDelete(addsSet: Set<Node>, $node: Node) {
  addsSet.delete($node);
  each($node.childNodes, $node => deepDelete(addsSet, $node));
}

export function isAncestorRemoved($target: Node, mirror: Mirror): boolean {
  const id = mirror.getId($target);

  if (!mirror.has(id)) return true;

  if (!$target.parentNode) return true;

  if ($target.parentNode.nodeType === $target.DOCUMENT_NODE) {
    return false;
  }
  return isAncestorRemoved($target.parentNode, mirror);
}

export function isParentRemoved(
  removes: Array<{ pId: number; id: number }>,
  $node: Node,
  mirror: Mirror
): boolean {
  const { parentNode } = $node;

  if (!parentNode) return false;

  if (removes.some(r => r.id === mirror.getId(parentNode))) return true;

  return isParentRemoved(removes, parentNode, mirror);
}

export function isAncestorInSet(set: Set<Node>, $node: Node): boolean {
  const { parentNode } = $node;

  if (!parentNode) return false;

  if (set.has(parentNode)) return true;

  return isAncestorInSet(set, parentNode);
}
