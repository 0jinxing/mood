import type { TNode, ThrottleOptions, IdNodeMap } from "./types";

export class Mirror {
  readonly idNodeMap: IdNodeMap = {};

  getId($node: Node | TNode) {
    if ("__sn" in $node) {
      return $node.__sn.id;
    }
    return 0;
  }

  getNode<T extends Node = Node>(id: number) {
    return (this.idNodeMap[id] as unknown) as (T & TNode) | undefined;
  }

  remove($node: TNode) {
    const id = this.getId($node);
    delete this.idNodeMap[id];

    if ($node.childNodes) {
      $node.childNodes.forEach(($childNode) =>
        this.remove(($childNode as Node) as TNode)
      );
    }
  }

  has(id: number) {
    return this.idNodeMap.hasOwnProperty(id);
  }
}

export const mirror = new Mirror();

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
