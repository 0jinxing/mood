class Mirror {
  private readonly idPool = new WeakMap<EventTarget, number>();
  private readonly nodePool = new Map<number, Node>();

  set(id: number, $node: Node) {
    this.idPool.set($node, id);
    this.nodePool.set(id, $node);
  }

  getId<T extends EventTarget>($target: T) {
    return this.idPool.get($target) || 0;
  }

  getNode<T extends Node>(id: number) {
    return this.nodePool.get(id) as T | undefined;
  }

  remove(nodeOrId: Node | number) {
    let id: number;
    let node: Node | undefined;

    if (typeof nodeOrId === 'number') {
      id = nodeOrId;
      node = this.nodePool.get(nodeOrId);
    } else {
      id = this.getId(nodeOrId);
      node = nodeOrId;
    }

    if (!node) return;

    this.idPool.delete(node);
    this.nodePool.delete(id);

    const { childNodes } = node;
    if (childNodes) {
      childNodes.forEach($childNode => this.remove($childNode));
    }
  }

  has(nodeOrId: number | Node) {
    if (typeof nodeOrId === 'number') return !!this.nodePool.has(nodeOrId);
    return this.idPool.has(nodeOrId);
  }
}

export const mirror = new Mirror();
