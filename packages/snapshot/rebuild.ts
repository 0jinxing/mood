import {
  ElementNode,
  SerializedNodeWithId,
  NodeType,
  TNode,
  mirror,
  AddedNodeMutation,
} from "@traps/common";
import { serializeWithId } from ".";

function getTagName(node: ElementNode) {
  let tagName = node.tagName;
  if (tagName === "link" && node.attributes.hasOwnProperty("_cssText")) {
    tagName = "style";
  } else if (tagName === "script") {
    tagName = "noscript";
  }
  return tagName;
}

const HOVER_SELECTOR = /([^\s\\,.{};][^\\,{};]?):hover/gi;

export function addHoverClass(cssText: string): string {
  return cssText.replace(HOVER_SELECTOR, "$1:hover,$1.\\:hover");
}

export function buildNode(
  node: SerializedNodeWithId,
  $doc: HTMLDocument
): Node | null {
  if (node.type === NodeType.DOCUMENT_NODE) {
    return $doc.implementation.createDocument(null, "", null);
  } else if (node.type === NodeType.DOCUMENT_TYPE_NODE) {
    const { name, publicId, systemId } = node;
    return $doc.implementation.createDocumentType(name, publicId, systemId);
  } else if (node.type === NodeType.ELEMENT_NODE) {
    const tagName = getTagName(node);
    const { attributes, isSVG } = node;
    const $el = isSVG
      ? $doc.createElementNS("http://www.w3.org/2000/svg", tagName)
      : $doc.createElement(tagName);

    for (let [key, attrValue] of Object.entries(attributes)) {
      if (typeof attrValue === "boolean" && !attrValue) continue;
      let value = attrValue === true ? "" : attrValue;

      if (!key.startsWith("__")) {
        const isTextarea = tagName === "textarea" && key === "value";
        const isRemoteOrDynamicCss = tagName === "style" && key === "_cssText";

        if (isRemoteOrDynamicCss) {
          value = addHoverClass(value);
        }

        if (isTextarea || isRemoteOrDynamicCss) {
          const $child = $doc.createTextNode(value);
          for (const $childNode of Array.from($el.childNodes)) {
            if ($childNode.nodeType === $el.TEXT_NODE) {
              $el.removeChild($childNode);
            }
          }
          $el.appendChild($child);
          continue;
        }

        if (tagName === "iframe" && key === "src") continue;

        try {
          if (isSVG && key === "xlink:href") {
            $el.setAttributeNS("http://www.w3.org/1999/xlink", key, value);
          } else if (/^on[a-z]+/.test(key)) {
            // Rename some of the more common atttributes from https://www.w3schools.com/tags/ref_eventattributes.asp
            // as setting them triggers a console.error (which shows up despite the try/catch)
            // Assumption: these attributes are not used to css
            $el.setAttribute("_" + key, value);
          } else {
            $el.setAttribute(key, value);
          }
        } catch {
          // skip invalid attribute
        }
      } else {
        if (tagName === "canvas" && key === "__dataURL") {
          const $image = $doc.createElement("img");
          $image.src = value;
          $image.addEventListener("load", () => {
            const ctx = ($el as HTMLCanvasElement).getContext("2d");
            if (ctx) ctx.drawImage($image, 0, 0, $image.width, $image.height);
          });
        } else if (key === "__width") {
          $el.style.width = value;
        } else if (key === "__height") {
          $el.style.height = value;
        } else if (key === "__mediaState") {
          if (value === "played") {
            ($el as HTMLMediaElement).play();
          } else if (value === "paused") {
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

function rebuild(adds: AddedNodeMutation[], $doc: HTMLDocument) {
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

  // throw "TODO";
  // return buildNodeWithSN(node, $doc);
}

export default rebuild;
