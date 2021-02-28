const ID_KEY = Symbol.for('#id');

class Mirror {
  private readonly pool: Record<number, EventTarget> = {};

  set(id: number, $node: Node) {
    this.pool[id] = $node;
    Reflect.set($node, ID_KEY, id);
  }

  getId<T extends EventTarget>($target: T): number {
    return Reflect.get($target, ID_KEY) || 0;
  }

  getNode<T extends Node>(id: number) {
    return this.pool[id] as T | undefined;
  }

  remove(node: Node) {
    const id = this.getId(node);
    delete this.pool[id];
    Reflect.deleteProperty(node, ID_KEY);

    const { childNodes } = node;
    if (childNodes) {
      childNodes.forEach($childNode => this.remove($childNode));
    }
  }

  has(id: number) {
    return !!this.pool[id];
  }
}

export const mirror = new Mirror();
