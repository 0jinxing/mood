import { ListenerHandler, TNode } from "@traps/common";
import { mirror } from "@traps/common";

export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  $target: Document | Window = document
): ListenerHandler {
  const options = { capture: true, passive: true };
  $target.addEventListener(type, fn, options);
  return () => $target.removeEventListener(type, fn, options);
}

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

export function isAncestorRemoved($target: TNode): boolean {
  const id = mirror.getId($target);
  if (!mirror.has(id)) return true;

  if (!$target.parentNode) return true;

  if ($target.parentNode.nodeType === $target.DOCUMENT_NODE) {
    return false;
  }
  return isAncestorRemoved(($target.parentNode as Node) as TNode);
}
