import type { Mirror, TNode, ThrottleOptions } from "./types";

export const mirror: Mirror = {
  idNodeMap: {},
  getId($node) {
    if ("__sn" in $node) {
      return $node.__sn.id;
    }
    return 0;
  },
  getNode<T extends Node = Node>(id: number) {
    return (mirror.idNodeMap[id] as unknown) as (T & TNode) | undefined;
  },
  removeNodeFromMap($node) {
    const id = mirror.getId($node);
    delete mirror.idNodeMap[id];

    if ($node.childNodes) {
      $node.childNodes.forEach(($childNode) =>
        mirror.removeNodeFromMap(($childNode as Node) as TNode)
      );
    }
  },
  has(id) {
    return mirror.idNodeMap.hasOwnProperty(id);
  },
};

export function throttle<T>(
  func: (arg: T) => void,
  wait: number,
  options?: ThrottleOptions
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

export * from "./types";
