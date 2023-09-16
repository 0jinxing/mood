import { SNWithId, NodeTypes } from './types';
import { mirror } from './utils';

const HOVER_MATCH = /([^{}]+):hover([^{}]*{[^{}]+})/gi;

export function hover(cssText: string): string {
  return cssText.replace(HOVER_MATCH, '$1:hover$2 $1.\\:hover$2');
}

export function buildNode(node: SNWithId, $doc: Document): Node | null {
  if (node.type === NodeTypes.DOC_NODE) {
    return $doc.implementation.createDocument(null, '', null);
  }

  if (node.type === NodeTypes.DOC_TYPE_NODE) {
    const { name, publicId, systemId } = node;
    return $doc.implementation.createDocumentType(name, publicId, systemId);
  }

  if (node.type === NodeTypes.ELE_NODE) {
    const tagName = node.tagName;

    const { attrs, svg } = node;
    const $el = svg
      ? $doc.createElementNS('http://www.w3.org/2000/svg', tagName)
      : $doc.createElement(tagName);

    for (const [key, attrVal] of Object.entries(attrs)) {
      if (typeof attrVal === 'boolean' && !attrVal) continue;

      const value = attrVal === true ? '' : attrVal;
      const isTextarea = /TEXTAREA/i.test(tagName);

      if (isTextarea && key === 'value') {
        const $child = $doc.createTextNode(value);
        $el.appendChild($child);
        continue;
      }

      if (/IFRAME/i.test(tagName) && key === 'src') continue;

      try {
        if (svg && key === 'xlink:href') {
          $el.setAttributeNS('http://www.w3.org/1999/xlink', key, value);
        } else if (!/^on[a-z]+/.test(key)) {
          $el.setAttribute(key, value);
        }
      } catch {
        // skip invalid attribute
      }
    }
    return $el;
  }

  if (node.type === NodeTypes.TEXT_NODE) {
    const { style, textContent } = node;
    return $doc.createTextNode(style ? hover(textContent) : textContent);
  }

  if (node.type === NodeTypes.CDATA_NODE) {
    return $doc.createCDATASection(node.textContent);
  }

  return null;
}

export function buildNodeWithSN(node: SNWithId, $doc: Document): Node | null {
  let $el = buildNode(node, $doc);

  if (!$el) return null;

  if (node.type === NodeTypes.DOC_NODE) {
    $el = $doc;
    // Close before open to make sure document was closed
    $doc.close();
    $doc.open();
  }
  mirror.set(node.id, $el);

  return $el;
}

export function rebuild(adds: SNWithId[], $doc: Document) {
  adds.forEach(({ pId, nId, ...node }) => {
    const $el = buildNodeWithSN(node, $doc)!;

    const $parent = pId ? mirror.getNode(pId) : undefined;
    const $next = nId ? mirror.getNode(nId) : undefined;

    if (node.type === NodeTypes.DOC_NODE || node.type === NodeTypes.DOC_TYPE_NODE) {
      /**
       * ignore
       */
    } else if (!$parent) {
      $doc.appendChild($el);
      $doc.close();
    } else if ($parent && $next && $parent.contains($next)) {
      $parent.insertBefore($el, $next);
    } else {
      $parent.appendChild($el);
    }
  });
}
