import { IdNodeMap, SerializedNodeWithId } from '../types';
import { getExtraData } from './extra';

export class Mirror {
  readonly idNodeMap: IdNodeMap = {};

  getId<T extends EventTarget = Node>($node: T) {
    const sn = getExtraData<SerializedNodeWithId>($node);
    if (sn) return sn.id;
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
