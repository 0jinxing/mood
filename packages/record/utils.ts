import { ExtNode, mirror } from '@mood/snapshot';

export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  $target: Document | Window = document
): VoidFunction {
  const options = { capture: true, passive: true };
  $target.addEventListener(type, fn, options);
  return () => $target.removeEventListener(type, fn, options);
}

export type Throttled = {
  (...args: any): void;
  timestamp: number;
};

export function throttle<T>(func: (arg: T) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let previous = 0;
  let lastArgs: any[];

  const later = () => {
    previous = Date.now();
    timeout = undefined;
    func.apply(null, lastArgs);
  };

  const throttled: Throttled = (...args: any[]) => {
    throttled.timestamp = Date.now();
    lastArgs = args;
    previous = previous || throttled.timestamp;

    const remaining = wait - (throttled.timestamp - previous);
    if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
  };
  throttled.timestamp = 0;

  return throttled;
}

export function hookSetter<T>(
  target: T,
  key: string | number | symbol,
  descriptor: PropertyDescriptor,
  isRevoked?: boolean
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(
    target,
    key,
    isRevoked
      ? descriptor
      : {
          set(value) {
            original && original.set && original.set.call(this, value);
            // put hooked setter into event loop to avoid of set latency
            setTimeout(() => descriptor.set!.call(this, value));
          }
        }
  );
  return () => hookSetter(target, key, original || {}, true);
}

export function isNativeFun(fun: Function) {
  return /\[native\s+code\]/i.test(fun.toString());
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

export function isAncestorRemoved($target: ExtNode): boolean {
  const id = mirror.getId($target);
  if (!mirror.has(id)) return true;

  if (!$target.parentNode) return true;

  if ($target.parentNode.nodeType === $target.DOCUMENT_NODE) {
    return false;
  }
  return isAncestorRemoved(($target.parentNode as Node) as ExtNode);
}

export function deepDelete(addsSet: Set<Node>, $node: Node) {
  addsSet.delete($node);
  $node.childNodes.forEach(childN => deepDelete(addsSet, childN));
}

export function isParentRemoved(
  removes: Array<{ parentId: number; id: number }>,
  $node: Node
): boolean {
  const { parentNode } = $node;
  if (!parentNode) return false;
  const parentId = mirror.getId((parentNode as Node) as ExtNode);
  if (removes.some(r => r.id === parentId)) return true;
  return isParentRemoved(removes, parentNode);
}

export function isAncestorInSet(set: Set<Node>, $node: Node): boolean {
  const { parentNode } = $node;
  if (!parentNode) return false;
  if (set.has(parentNode)) return true;
  return isAncestorInSet(set, parentNode);
}
