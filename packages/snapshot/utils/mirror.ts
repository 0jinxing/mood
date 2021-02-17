import { ElementAddition, IdNodeMap } from '../types';
import { getAddition } from './addition';

export class Mirror {
  readonly idNodeMap: IdNodeMap = {};

  getId<T extends EventTarget = Node>($node: T) {
    const addition = getAddition<ElementAddition>($node);
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
