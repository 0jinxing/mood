export type Addition<K = string, B = any> = {
  kind: K;
  base: B;
};

export type ElementAddition = Addition<'element', number>;

export type IdNodeMap = {
  [key: number]: EventTarget;
};

export class Mirror {
  private readonly dataPool: WeakMap<EventTarget, Addition> = new WeakMap();

  readonly idNodeMap: IdNodeMap = {};

  getData<T extends Addition>($node: EventTarget) {
    return this.dataPool.get($node) as T | undefined;
  }

  setData($node: Node, data: Addition) {
    this.dataPool.set($node, data);
  }

  getId<T extends EventTarget = Node>($node: T) {
    const addition = mirror.getData<ElementAddition>($node);
    if (addition) return addition.base;
    return 0;
  }

  getNode<T extends Node>(id: number) {
    return this.idNodeMap[id] as T | undefined;
  }

  remove($node: Node) {
    const id = this.getId($node);
    delete this.idNodeMap[id];

    const { childNodes } = $node;

    if (childNodes) {
      childNodes.forEach($childNode => this.remove($childNode));
    }
  }

  has(id: number) {
    return !!this.idNodeMap[id];
  }
}

export const mirror = new Mirror();
