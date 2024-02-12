import { each } from '@mood/utils';

type WithId<T> = T & { ['@@id']?: number };

export class Mirror {
  readonly pool: Record<number, EventTarget | undefined> = {};

  set(id: number, $node: WithId<Node>) {
    if ($node['@@id'] === id) return;

    this.pool[id] = $node;
    $node['@@id'] = id;
  }

  getId<T extends WithId<EventTarget>>($target: T | null): number {
    return $target?.['@@id'] || 0;
  }

  getNode<T extends Node>(id: number) {
    return this.pool[id] as T | undefined;
  }

  remove($node: WithId<Node>) {
    const id = this.getId($node);

    if (!id) return;

    this.pool[id] = undefined;
    $node['@@id'] = undefined;

    each($node.childNodes, $child => this.remove($child));
  }

  has(id: number) {
    return !!this.pool[id];
  }
}
