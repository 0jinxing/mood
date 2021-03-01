type WithId<T> = T & { __id?: number };

class Mirror {
  private readonly pool: Record<number, EventTarget> = {};

  set(id: number, $node: WithId<Node>) {
    this.pool[id] = $node;
    $node.__id = id;
  }

  getId<T extends WithId<EventTarget>>($target: T): number {
    return $target.__id || 0;
  }

  getNode<T extends Node>(id: number) {
    return this.pool[id] as T | undefined;
  }

  remove(node: WithId<Node>) {
    const id = this.getId(node);

    delete this.pool[id];
    delete node.__id;

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
