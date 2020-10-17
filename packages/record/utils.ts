import { TNode, mirror } from '@mood/snapshot';

export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  $target: Document | Window = document
): VoidFunction {
  const options = { capture: true, passive: true };

  $target.addEventListener(type, fn, options);
  return () => $target.removeEventListener(type, fn, options);
}

export function throttle<T>(
  func: (arg: T) => void,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let previous = 0;
  return (...args: any[]) => {
    const now = Date.now();
    const { leading, trailing } = options || {};
    !previous && leading === false && (previous = now);
    const remaining = wait - (now - previous);
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

export function plain(val: any): unknown {
  switch (typeof val) {
    case 'number':
    case 'boolean':
    case 'string':
    case 'undefined': {
      return val;
    }
    case 'object': {
      if (Symbol.iterator in val) {
        const reslut = [];
        for (const i of val) {
          reslut.push(plain(i));
        }
        return reslut;
      } else if (val instanceof RegExp) {
        return `RegExp: ${val.source}/${val.flags ?? '[none]'}`;
      } else if (val) {
        return Object.getOwnPropertyNames(val).reduce(
          (obj: any, key) => Object.assign({}, obj, { [key]: plain(val[key]) }),
          {}
        );
      }
    }
  }

  return Object.prototype.toString.call(val);
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
  $node.childNodes.forEach(childN => deepDelete(addsSet, childN));
}

export function isParentRemoved(
  removes: Array<{ parentId: number; id: number }>,
  $node: Node
): boolean {
  const { parentNode } = $node;
  if (!parentNode) return false;
  const parentId = mirror.getId((parentNode as Node) as TNode);
  if (removes.some(r => r.id === parentId)) return true;
  return isParentRemoved(removes, parentNode);
}

export function isAncestorInSet(set: Set<Node>, $node: Node): boolean {
  const { parentNode } = $node;
  if (!parentNode) return false;
  if (set.has(parentNode)) return true;
  return isAncestorInSet(set, parentNode);
}
