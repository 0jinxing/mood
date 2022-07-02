import { SNWithId, NT } from './types';
import { mirror, pseudoToClass } from './utils';

export function buildNode(node: SNWithId, $doc: Document): Node | null {
  if (node.type === NT.DOC_NODE) return $doc;

  if (node.type === NT.ELE_NODE) {
    const { attrs = {}, tagName, svg } = node;

    const $el = svg
      ? $doc.createElementNS('http://www.w3.org/2000/svg', tagName)
      : $doc.createElement(tagName);

    for (const [key, attrVal] of Object.entries(attrs)) {
      const textarea = /textarea/i.test(tagName);
      const value = attrVal!;

      if (textarea && key === 'value') {
        const $child = $doc.createTextNode(value);
        $el.appendChild($child);
        continue;
      }

      if (/iframe/i.test(tagName) && key === 'src') continue;

      try {
        if (key === 'xlink:href' && svg) {
          $el.setAttributeNS('http://www.w3.org/1999/xlink', key, value);
          continue;
        }
        $el.setAttribute(key, value);
      } catch {
        // skip invalid attribute
      }
    }
    return $el;
  }

  if (node.type === NT.TEXT_NODE) {
    const { textContent, style } = node;
    return $doc.createTextNode(
      style ? textContent + pseudoToClass(textContent, ':hover') : textContent
    );
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
