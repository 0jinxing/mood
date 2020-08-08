import {
  ElementNode,
  SerializedNodeWithId,
  NodeType,
  TNode,
  AddedNode
} from './types';
import { mirror } from './utils';

function getTagName(node: ElementNode) {
  let tagName = node.tagName;

  if (/LINK/i.test(tagName) && node.attributes._cssText) {
    tagName = 'STYLE';
  } else if (/SCRIPT/i.test(tagName)) {
    tagName = 'NOSCRIPT';
  }
  return tagName;
}

const HOVER_MATCH = /([^{}]+):hover([^{}]*{[^{}]+})/gi;

export function addHoverClass(cssText: string): string {
  return cssText.replace(HOVER_MATCH, '$1:hover$2 $1.\\:hover$2');
}

export function buildNode(
  node: SerializedNodeWithId,
  $doc: HTMLDocument
): Node | null {
  if (node.type === NodeType.DOCUMENT_NODE) {
    return $doc.implementation.createDocument(null, '', null);
  }

  if (node.type === NodeType.DOCUMENT_TYPE_NODE) {
    const { name, publicId, systemId } = node;
    return $doc.implementation.createDocumentType(name, publicId, systemId);
  }

  if (node.type === NodeType.ELEMENT_NODE) {
    const tagName = getTagName(node);
    const { attributes, isSVG } = node;
    const $el = isSVG
      ? $doc.createElementNS('http://www.w3.org/2000/svg', tagName)
      : $doc.createElement(tagName);

    for (const [key, attrValue] of Object.entries(attributes)) {
      if (typeof attrValue === 'boolean' && !attrValue) continue;
      let value = attrValue === true ? '' : attrValue;

      if (!key.startsWith('__')) {
        const isTextarea = tagName === 'TEXTAREA' && key === 'value';
        const isRemoteOrDynamicCss = tagName === 'STYLE' && key === '_cssText';

        if (isRemoteOrDynamicCss) {
          value = addHoverClass(value);
        }

        if (isTextarea || isRemoteOrDynamicCss) {
          const $child = $doc.createTextNode(value);
          $el.appendChild($child);
          continue;
        }

        if (tagName === 'iframe' && key === 'src') continue;

        try {
          if (isSVG && key === 'xlink:href') {
            $el.setAttributeNS('http://www.w3.org/1999/xlink', key, value);
          } else if (!/^on[a-z]+/.test(key)) {
            $el.setAttribute(key, value);
          }
        } catch {
          // skip invalid attribute
        }
      } else {
        if (tagName === 'canvas' && key === '__dataURL') {
          const $image = $doc.createElement('img');
          $image.src = value;
          $image.addEventListener('load', () => {
            const ctx = ($el as HTMLCanvasElement).getContext('2d');
            if (ctx) ctx.drawImage($image, 0, 0, $image.width, $image.height);
          });
        } else if (key === '__width') {
          $el.style.width = value;
        } else if (key === '__height') {
          $el.style.height = value;
        } else if (key === '__mediaState') {
          if (value === 'played') {
            ($el as HTMLMediaElement).play();
          } else if (value === 'paused') {
            ($el as HTMLMediaElement).pause();
          }
        }
      }
    }
    return $el;
  } else if (node.type === NodeType.TEXT_NODE) {
    const { isStyle, textContent } = node;
    return $doc.createTextNode(
      isStyle ? addHoverClass(textContent) : textContent
    );
  }
  // CDATA or Comment
  let $el: Node | null = null;
  if (node.type === NodeType.CDATA_SECTION_NODE) {
    $el = $doc.createCDATASection(node.textContent);
  } else if (node.type === NodeType.COMMENT_NODE) {
    $el = $doc.createComment(node.textContent);
  }
  return $el;
}

export function buildNodeWithSN(
  node: SerializedNodeWithId,
  $doc: HTMLDocument
): TNode | null {
  let $el = buildNode(node, $doc);

  if (!$el) return null;

  if (node.type === NodeType.DOCUMENT_NODE) {
    $el = $doc;
    // Close before open to make sure document was closed
    $doc.close();
    $doc.open();
  }
  ($el as TNode).__sn = node;
  mirror.idNodeMap[node.id] = $el as TNode;

  return $el as TNode;
}

function rebuild(adds: AddedNode[], $doc: HTMLDocument) {
  adds.forEach(({ node, parentId, nextId }) => {
    const $el = buildNodeWithSN(node, $doc)!;

    const $parent = parentId ? mirror.getNode(parentId) : undefined;
    const $next = nextId ? mirror.getNode(nextId) : undefined;

    if (
      node.type === NodeType.DOCUMENT_NODE ||
      node.type === NodeType.DOCUMENT_TYPE_NODE
    ) {
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

export default rebuild;
