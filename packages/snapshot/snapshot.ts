import { each } from '@mood/utils';
import {
  mirror,
  attrs,
  block,
  rStyle,
  next,
  isDocument,
  isElement,
  isText,
  pseudoToClass,
  sheetToString
} from './utils';
import { NT, SNWithId } from './types';

let id = 0;
const genId = () => ++id;

export function serialize($node: Node, $doc: Document): SNWithId[] {
  if (block($node)) return [];

  const id = mirror.getId($node) || genId();

  mirror.set(id, $node);

  if (isText($node)) {
    const style = isElement($node, 'style');
    const textContent = style ? rStyle($node.textContent || '') : $node.textContent || '';
    return [{ id, type: NT.TEXT_NODE, textContent, style }];
  }

  if (isDocument($node)) {
    return [{ id, type: NT.DOC_NODE, title: $node.title }];
  }

  if (isElement($node, 'link')) {
    const styleSheet = Array.from($doc.styleSheets).find(i => i.href === $node.href);
    const cssText = pseudoToClass(styleSheet ? sheetToString(styleSheet) : '', ':hover');

    if (cssText) {
      const styleElId = genId();
      return [
        { id, type: NT.ELE_NODE, tagName: $node.tagName, attrs: attrs($node) },
        { id: styleElId, type: NT.ELE_NODE, tagName: 'STYLE', attrs: {} },
        { id: genId(), pId: styleElId, type: NT.TEXT_NODE, textContent: rStyle(cssText) }
      ];
    }
  }

  if (isElement($node)) {
    return [{ id, type: NT.ELE_NODE, tagName: $node.tagName, attrs: attrs($node) }];
  }

  return [];
}

export function snapshot($doc: Document): SNWithId[] {
  const adds: SNWithId[] = [];

  const walk = ($node: Node) => {
    const $next = next($node);

    const pId = $node.parentElement ? mirror.getId($node.parentElement) : undefined;
    const nId = $next ? mirror.getId($next) : undefined;

    const result = serialize($node, $doc);

    adds.push(...result.map(i => ({ pId, nId, ...i })));

    result.length && each($node.childNodes, walk, true);
  };

  walk($doc);

  return adds;
}
