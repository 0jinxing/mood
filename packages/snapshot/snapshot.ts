import { mirror, transformAttr, absoluteToStylesheet } from './utils';
import {
  SerializedNode,
  NodeType,
  Attributes,
  ExtNode,
  SerializedNodeWithId,
  AddedNode
} from './types';

let id = 0;
function genId(): number {
  return ++id;
}

function getCSSText(styleSheet: CSSStyleSheet): string {
  try {
    const rules = styleSheet.cssRules;
    return Array.from(rules).reduce(
      (css, rule) => css + getCSSRuleText(rule),
      ''
    );
  } catch {
    return '';
  }
}

function getCSSRuleText(rule: CSSRule): string {
  return rule instanceof CSSImportRule
    ? getCSSText(rule.styleSheet)
    : rule.cssText;
}

function isSVGElement($el: Element): boolean {
  return /SVG/i.test($el.tagName) || $el instanceof SVGElement;
}

function serialize($node: Node, $doc: HTMLDocument): SerializedNode | null {
  if ($node instanceof Document) {
    return { type: NodeType.DOCUMENT_NODE };
  }

  if ($node instanceof DocumentType) {
    return {
      type: NodeType.DOCUMENT_TYPE_NODE,
      name: $node.name,
      publicId: $node.publicId,
      systemId: $node.systemId
    };
  }

  if ($node instanceof Element) {
    const attributes: Attributes = {};
    for (const { name, value } of Array.from($node.attributes)) {
      attributes[name] = transformAttr(name, value);
    }
    // styleSheets link => inline style & absolute url
    if ($node instanceof HTMLLinkElement) {
      const styleSheet = Array.from($doc.styleSheets).find(
        sheet => sheet.href === $node.href
      ) as CSSStyleSheet;
      const cssText = styleSheet ? getCSSText(styleSheet) : '';
      if (cssText) {
        delete attributes.rel;
        delete attributes.href;
        attributes.cssText = absoluteToStylesheet(cssText);
      }
    }

    // handle form fields
    if ($node instanceof HTMLInputElement) {
      const type = attributes.type;
      const value = $node.value;
      if (type !== 'radio' && type !== 'checkbox') {
        attributes.value = value;
      } else {
        attributes.checked = $node.checked;
      }
    }

    if (
      $node instanceof HTMLTextAreaElement ||
      $node instanceof HTMLSelectElement
    ) {
      const value = $node.value;
      attributes.value = value;
    } else if ($node instanceof HTMLOptionElement) {
      attributes.selected = $node.selected;
    }

    // handle canvas
    if ($node instanceof HTMLCanvasElement) {
      let dataURL = '';
      try {
        dataURL = $node.toDataURL();
      } catch {
        // @WARN cross
      }
      attributes.dataURL = dataURL;
    }

    // handle audio and video
    if (
      $node instanceof HTMLAudioElement ||
      $node instanceof HTMLVideoElement
    ) {
      attributes.mediaState = $node.paused;
    }
    return {
      type: NodeType.ELEMENT_NODE,
      tagName: $node.tagName,
      attributes,
      isSVG: isSVGElement($node)
    };
  }

  if ($node instanceof Text) {
    const $parentNode = $node.parentNode;
    let textContent = $node.textContent;
    const isStyle = $parentNode instanceof HTMLStyleElement;
    if (isStyle && textContent) {
      textContent = absoluteToStylesheet(textContent);
    } else if ($parentNode instanceof HTMLScriptElement) {
      textContent = 'SCRIPT_PLACEHOLDER';
    }
    return {
      type: NodeType.TEXT_NODE,
      textContent: textContent || '',
      isStyle
    };
  }

  if ($node instanceof CDATASection) {
    return { type: NodeType.CDATA_SECTION_NODE, textContent: '' };
  }

  if ($node instanceof Comment) {
    return {
      type: NodeType.COMMENT_NODE,
      textContent: $node.textContent || ''
    };
  }

  return null;
}

export function serializeWithId(
  $node: Node | ExtNode,
  $doc: HTMLDocument
): SerializedNodeWithId | null {
  const serializedNode = serialize($node, $doc);
  if (!serializedNode) {
    // @WARN not serialized
    return null;
  }
  const id = '__sn' in $node ? $node.__sn.id : genId();
  const nodeWithId = Object.assign(serializedNode, { id });
  ($node as ExtNode).__sn = nodeWithId;
  mirror.idNodeMap[id] = $node as ExtNode;

  return nodeWithId;
}

export function snapshot($doc: HTMLDocument): AddedNode[] {
  const adds: AddedNode[] = [];
  const queue: Node[] = [$doc];

  const serializeAdds = ($node: Node | ExtNode) => {
    const parentId = $node.parentElement
      ? mirror.getId($node.parentElement)
      : undefined;

    const nextId = $node.nextSibling
      ? mirror.getId($node.nextSibling)
      : undefined;

    if (nextId === 0 || parentId === 0) {
      queue.unshift($node);
      return;
    }

    adds.push({
      parentId: parentId,
      nextId: nextId,
      node: serializeWithId($node, $doc)!
    });
    $node.childNodes.forEach(serializeAdds);
  };

  while (queue.length) {
    serializeAdds(queue.pop()!);
  }

  return adds;
}
