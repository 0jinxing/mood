import {
  mirror,
  transformAttr,
  absoluteToStylesheet,
  ElementAddition
} from './utils';
import { SN, NT, Attributes, SNWithId, AddedNode } from './types';

let id = 0;
function genId(): number {
  return ++id;
}

function getTagName($el: Element) {
  const [, tagName] = $el.innerHTML.match(/<(\S+)/)!;
  return tagName;
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

function isSVGElement($el: Element): $el is SVGElement {
  return /SVG/i.test(getTagName($el)) || $el instanceof SVGElement;
}

function serialize($node: Node, $doc: HTMLDocument): SN | null {
  if ($node instanceof Document) {
    return { type: NT.DOCUMENT_NODE };
  }

  if ($node instanceof DocumentType) {
    return {
      type: NT.DOCUMENT_TYPE_NODE,
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

    return {
      type: NT.ELEMENT_NODE,
      tagName: getTagName($node),
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
      type: NT.TEXT_NODE,
      textContent: textContent || '',
      isStyle
    };
  }

  if ($node instanceof CDATASection) {
    return { type: NT.CDATA_SECTION_NODE, textContent: '' };
  }

  if ($node instanceof Comment) {
    return {
      type: NT.COMMENT_NODE,
      textContent: $node.textContent || ''
    };
  }

  return null;
}

export function serializeWithId(
  $node: Node,
  $doc: HTMLDocument
): SNWithId | null {
  const serializedNode = serialize($node, $doc);
  if (!serializedNode) {
    // @WARN not serialized
    return null;
  }
  const addition = mirror.getData<ElementAddition>($node);
  const id = addition ? addition.base : genId();

  mirror.setData($node, { kind: 'element', base: id });
  mirror.idNodeMap[id] = $node;

  return Object.assign(serializedNode, { id });
}

export function snapshot($doc: HTMLDocument): AddedNode[] {
  const adds: AddedNode[] = [];
  const queue: Node[] = [$doc];

  const serializeAdds = ($node: Node) => {
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
