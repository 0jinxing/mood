import { mirror } from "@traps/common";
import type { TNode } from "@traps/common";

export function deepDelete(addsSet: Set<Node>, $node: Node) {
  addsSet.delete($node);
  $node.childNodes.forEach((childN) => deepDelete(addsSet, childN));
}

export function isParentRemoved(
  removes: Array<{ parentId: number; id: number }>,
  $node: Node
): boolean {
  const { parentNode } = $node;
  if (!parentNode) return false;
  const parentId = mirror.getId((parentNode as Node) as TNode);
  if (removes.some((r) => r.id === parentId)) return true;
  return isParentRemoved(removes, parentNode);
}

export function isAncestorInSet(set: Set<Node>, $node: Node): boolean {
  const { parentNode } = $node;
  if (!parentNode) return false;
  if (set.has(parentNode)) return true;
  return isAncestorInSet(set, parentNode);
}
