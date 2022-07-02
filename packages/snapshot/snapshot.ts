import {
  mirror,
  attrs,
  block,
  rStyle,
  next,
  isDocument,
  isElement,
  isText,
  isSVG,
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
    const style = isElement($node.parentElement, 'style');
    const textContent = style ? rStyle($node.textContent || '') : $node.textContent || '';
    return [{ id, type: NT.TEXT_NODE, textContent: textContent, style: style || undefined }];
  }

  if (isDocument($node)) {
    return [{ id, type: NT.DOC_NODE, title: $node.title }];
  }

  if (isElement($node, 'link')) {
    const styleSheet = Array.from($doc.styleSheets).find(i => i.href === $node.href);
    const cssText = pseudoToClass(styleSheet ? sheetToString(styleSheet) : '', ':hover');

    if (cssText) {
      const derive = genId();

      return [
        { id, type: NT.ELE_NODE, tagName: $node.tagName, attrs: attrs($node) },
        {
          pId: id,
          id: derive,
          type: NT.ELE_NODE,
          tagName: 'STYLE'
        },
        { id: genId(), pId: derive, type: NT.TEXT_NODE, textContent: rStyle(cssText), style: true }
      ];
    }
  }

  if (isElement($node)) {
    return [
      {
        id,
        type: NT.ELE_NODE,
        tagName: $node.tagName,
        attrs: attrs($node),
        svg: isSVG($node) || undefined
      }
    ];
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

    result.length && Array.from($node.childNodes).reverse().forEach(walk);
  };

  walk($doc);

  return adds;
}
