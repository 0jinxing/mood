import { each } from '@mood/utils';

type WithId<T> = T & { __id?: number };

class Mirror {
  private readonly pool: Record<number, EventTarget | undefined> = {};

  set(id: number, $node: WithId<Node>) {
    if ($node.__id === id) return;

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

    if (!id) return;

    this.pool[id] = undefined;
    node.__id = undefined;

    each(node.childNodes, $child => this.remove($child));
  }

  has(id: number) {
    return !!this.pool[id];
  }
}

export const mirror = new Mirror();
