import { TNode, mirror } from "@traps/snapshot";
import { ListenerHandler } from "./types";

export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  $target: Document | Window = document
): ListenerHandler {
  const options = { capture: true, passive: true };
  $target.addEventListener(type, fn, options);
  return () => $target.removeEventListener(type, fn, options);
}

export function throttle<T>(
  func: (arg: T) => void,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
) {
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
  let previous = 0;
  return (...args: any[]) => {
    const now = Date.now();
    const { leading, trailing } = options || {};
    !previous && leading === false && (previous = now);
    let remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      previous = now;
      func.apply(null, args);
    } else if (!timeout && !trailing) {
      timeout = setTimeout(() => {
        previous = leading === false ? 0 : Date.now();
        timeout = undefined;
        func.apply(null, args);
      }, remaining);
    }
  };
}

// viewport

export function queryWindowHeight(): number {
  return (
    window.innerHeight ||
    (document.documentElement && document.documentElement.clientHeight) ||
    (document.body && document.body.clientHeight)
  );
}

export function queryWindowWidth(): number {
  return (
    window.innerWidth ||
    (document.documentElement && document.documentElement.clientWidth) ||
    (document.body && document.body.clientWidth)
  );
}

/**
 * collection
 */

export function isAncestorRemoved($target: TNode): boolean {
  const id = mirror.getId($target);
  if (!mirror.has(id)) return true;

  if (!$target.parentNode) return true;

  if ($target.parentNode.nodeType === $target.DOCUMENT_NODE) {
    return false;
  }
  return isAncestorRemoved(($target.parentNode as Node) as TNode);
}

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
