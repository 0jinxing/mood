import { mirror, abs, absToStyle } from './utils';
import { NT, Attributes, SNWithId } from './types';

let id = 0;
function genId(): number {
  return ++id;
}

function getTagName($el: Element) {
  if ($el instanceof HTMLFormElement) return 'FORM';
  return $el.tagName;
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

export function serialize(
  $node: Node,
  $doc: Document
): SNWithId | SNWithId[] | null {
  const id = mirror.getId($node) || genId();
  mirror.set(id, $node);

  if ($node instanceof Document) {
    return { id, type: NT.DOCUMENT_NODE };
  }

  if ($node instanceof DocumentType) {
    return {
      id,
      type: NT.DOCUMENT_TYPE_NODE,
      name: $node.name,
      publicId: $node.publicId,
      systemId: $node.systemId
    };
  }

  if ($node instanceof Element) {
    const attributes: Attributes = {};
    for (const { name, value } of Array.from($node.attributes)) {
      attributes[name] = abs(name, value);
    }
    if ($node instanceof HTMLLinkElement) {
      const styleSheet = Array.from($doc.styleSheets).find(
        sheet => sheet.href === $node.href
      );
      const cssText = styleSheet ? getCSSText(styleSheet) : '';

      if (cssText) {
        delete attributes.rel;
        delete attributes.href;

        return [
          {
            id,
            type: NT.ELEMENT_NODE,
            tagName: 'STYLE',
            attributes
          },
          {
            id: genId(),
            parentId: id,
            type: NT.TEXT_NODE,
            textContent: absToStyle(cssText)
          }
        ];
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
      id,
      type: NT.ELEMENT_NODE,
      tagName: getTagName($node),
      attributes,
      isSVG: isSVGElement($node)
    };
  }

  if ($node instanceof CDATASection) {
    return { id, type: NT.CDATA_SECTION_NODE, textContent: '' };
  }

  if ($node instanceof Text) {
    const $parentNode = $node.parentNode;
    let textContent = $node.textContent;
    const isStyle = $parentNode instanceof HTMLStyleElement;
    if (isStyle && textContent) {
      textContent = absToStyle(textContent);
    }
    return {
      id,
      type: NT.TEXT_NODE,
      textContent: textContent || '',
      isStyle
    };
  }

  if ($node instanceof Comment) {
    return {
      id,
      type: NT.COMMENT_NODE,
      textContent: $node.textContent || ''
    };
  }

  return null;
}

export function snapshot($doc: Document): SNWithId[] {
  const adds: SNWithId[] = [];
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

    const result = serialize($node, $doc);
    const list = Array.isArray(result) ? result : result ? [result] : [];

    list.forEach(item => {
      adds.push({ parentId: parentId, nextId: nextId, ...item });
    });

    if (list.length === 0) return;

    const childNodes = $node.childNodes;

    for (let i = childNodes.length - 1; i >= 0; i--) {
      serializeAdds(childNodes[i]);
    }
  };

  while (queue.length) {
    serializeAdds(queue.pop()!);
  }

  return adds;
}
