import { mirror } from './utils';
import { SNWithId } from './types';
import { each } from '@mood/utils';
import { serialize } from './serialize';

export function snapshot($doc: Document): SNWithId[] {
  const adds: SNWithId[] = [];

  const walk = ($node: Node) => {
    const pId = $node.parentElement ? mirror.getId($node.parentElement) : undefined;

    const nId = $node.nextSibling ? mirror.getId($node.nextSibling) : undefined;

    const result = serialize($node, $doc);

    adds.push(...result.map(i => ({ pId, nId, ...i })));

    result.length && each($node.childNodes, walk, true);
  };

  walk($doc);

  return adds;
}
