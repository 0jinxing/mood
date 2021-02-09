import { ExtNode, Mirror, mirror } from '@mood/snapshot';

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

export function hook<T>(
  target: T,
  key: keyof T,
  descriptor: PropertyDescriptor
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, descriptor);

  return () => Object.defineProperty(target, key, original || {});
}

export function hookSetter<T>(
  target: T,
  key: keyof T,
  setter: (val: any) => void
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  return hook(target, key, {
    set(val) {
      original?.set?.call(this, val);
      setTimeout(() => setter.call(this, val));
    }
  });
}

export function hookFunc<T>(target: T, key: keyof T, func: Function) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  return hook(target, key, {
    value: function (...args: any[]) {
      const originalValue: Function | undefined = original?.value;
      const result = originalValue?.apply(this, args);
      setTimeout(() => func.apply(this, [result, args]));
      return result;
    }
  });
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

export const offscreenMirror = new Mirror();
