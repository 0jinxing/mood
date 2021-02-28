import { SNWithId, NT, AddedNode } from './types';
import { mirror } from './utils';

const HOVER_MATCH = /([^{}]+):hover([^{}]*{[^{}]+})/gi;

export function hover(cssText: string): string {
  return cssText.replace(HOVER_MATCH, '$1:hover$2 $1.\\:hover$2');
}

export function buildNode(node: SNWithId, $doc: HTMLDocument): Node | null {
  if (node.type === NT.DOCUMENT_NODE) {
    return $doc.implementation.createDocument(null, '', null);
  }

  if (node.type === NT.DOCUMENT_TYPE_NODE) {
    const { name, publicId, systemId } = node;
    return $doc.implementation.createDocumentType(name, publicId, systemId);
  }

  if (node.type === NT.ELEMENT_NODE) {
    const tagName = node.tagName;

    const { attributes, isSVG } = node;
    const $el = isSVG
      ? $doc.createElementNS('http://www.w3.org/2000/svg', tagName)
      : $doc.createElement(tagName);

    for (const [key, attrVal] of Object.entries(attributes)) {
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
        if (isSVG && key === 'xlink:href') {
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

  if (node.type === NT.TEXT_NODE) {
    const { isStyle, textContent } = node;
    return $doc.createTextNode(isStyle ? hover(textContent) : textContent);
  }

  if (node.type === NT.CDATA_SECTION_NODE) {
    return $doc.createCDATASection(node.textContent);
  }

  if (node.type === NT.COMMENT_NODE) {
    return $doc.createComment(node.textContent);
  }

  return null;
}

export function buildNodeWithSN(
  node: SNWithId,
  $doc: HTMLDocument
): Node | null {
  let $el = buildNode(node, $doc);

  if (!$el) return null;

  if (node.type === NT.DOCUMENT_NODE) {
    $el = $doc;
    // Close before open to make sure document was closed
    $doc.close();
    $doc.open();
  }
  mirror.set(node.id, $el);

  return $el;
}

export function rebuild(adds: AddedNode[], $doc: HTMLDocument) {
  adds.forEach(({ node, parentId, nextId }) => {
    const $el = buildNodeWithSN(node, $doc)!;

    const $parent = parentId ? mirror.getNode(parentId) : undefined;
    const $next = nextId ? mirror.getNode(nextId) : undefined;

    if (node.type === NT.DOCUMENT_NODE || node.type === NT.DOCUMENT_TYPE_NODE) {
      /**
       * ignore
       */
    } else if (!$parent) {
      $doc.appendChild($el);
    } else if ($parent && $next) {
      $parent.insertBefore($el, $next);
    } else {
      $parent.appendChild($el);
    }
  });
}
