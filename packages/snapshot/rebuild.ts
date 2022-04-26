import { SNWithId, NodeType } from './types';
import { mirror } from './utils';

const HOVER_MATCH = /([^{}]+):hover([^{}]*{[^{}]+})/gi;

export function hover(cssText: string): string {
  return cssText.replace(HOVER_MATCH, '$1:hover$2 $1.\\:hover$2');
}

export function buildNode(node: SNWithId, $doc: Document): Node | null {
  if (node.type === NodeType.DOC_NODE) {
    return $doc;
  }

  if (node.type === NodeType.ELE_NODE) {
    const { attrs, svg, tagName } = node;
    const html = /^html$/i.test(tagName);

    const $el = svg
      ? $doc.createElementNS('http://www.w3.org/2000/svg', tagName)
      : html
      ? $doc.documentElement
      : $doc.createElement(tagName);

    while ($el.firstChild && html) $el.removeChild($el.firstChild);

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

  if (node.type === NodeType.TEXT_NODE) {
    const { style, textContent } = node;
    return $doc.createTextNode(style ? hover(textContent) : textContent);
  }

  if (node.type === NodeType.CDATA_NODE) {
    return $doc.createCDATASection(node.textContent);
  }

  if (node.type === NodeType.COMMENT_NODE) {
    return $doc.createComment(node.textContent);
  }

  return null;
}

export function buildNodeWithSN(node: SNWithId, $doc: Document): Node | null {
  let $el = buildNode(node, $doc);

  if ($el) mirror.set(node.id, $el);

  return $el;
}

export function rebuild(adds: SNWithId[], $doc: Document) {
  adds.forEach(({ pId, nId, ...node }) => {
    const $el = buildNodeWithSN(node, $doc);
    const $parent = pId ? mirror.getNode(pId) : undefined;

    if (!$el || !$parent) return;

    if ($el instanceof HTMLHtmlElement || $el instanceof Document) return;

    const $next = nId ? mirror.getNode(nId) : undefined;

    $next && $parent.contains($next) ? $parent.insertBefore($el, $next) : $parent.appendChild($el);
  });
}
