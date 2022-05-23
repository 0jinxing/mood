import { SNWithId, NT } from './types';
import { mirror } from './utils';

export function hover(cssText: string): string {
  return cssText.replace(/([^{}]+):hover([^{}]*{[^{}]+})/gi, '$1:hover$2 $1.\\:hover$2');
}

export function buildNode(node: SNWithId, $doc: Document): Node | null {
  if (node.type === NT.DOC_NODE) return $doc;

  if (node.type === NT.ELE_NODE) {
    const { attrs, tagName } = node;

    const ns = attrs['xmlns'] as string;

    const $el = ns ? $doc.createElementNS(ns, tagName) : $doc.createElement(tagName);

    for (const [key, attrVal] of Object.entries(attrs)) {
      if (typeof attrVal === 'boolean' && !attrVal) continue;

      const value = attrVal === true ? '' : attrVal;

      const textarea = /textarea/i.test(tagName);

      if (textarea && key === 'value') {
        const $child = $doc.createTextNode(value);
        $el.appendChild($child);
        continue;
      }

      if (/iframe/i.test(tagName) && key === 'src') continue;

      try {
        $el.setAttribute(key, value);
      } catch {
        // skip invalid attribute
      }
    }
    return $el;
  }

  if (node.type === NT.TEXT_NODE) {
    const { style, textContent } = node;
    return $doc.createTextNode(style ? hover(textContent) : textContent);
  }

  return null;
}

export function buildNodeWithSN(node: SNWithId, $doc: Document): Node | null {
  let $el = buildNode(node, $doc);

  if ($el) mirror.set(node.id, $el);

  return $el;
}

export function rebuild(adds: SNWithId[], $doc: Document) {
  $doc.close();
  $doc.open();

  adds.forEach(({ pId, nId, ...node }) => {
    const $node = buildNodeWithSN(node, $doc);
    const $parent = pId ? mirror.getNode(pId) : undefined;

    if (!$node || node.type === NT.DOC_NODE) return;

    if (!$parent) {
      $doc.appendChild($node);
      return;
    }

    const $next = nId ? mirror.getNode(nId) : undefined;

    $next && $parent.contains($next)
      ? $parent.insertBefore($node, $next)
      : $parent.appendChild($node);
  });
}
