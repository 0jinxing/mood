import { mirror, rAttr, rStyle } from './utils';
import { NT, Attrs, SNWithId } from './types';
import { reduce, each } from '@mood/utils';

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
    const handler = (text: string, item: CSSRule) => {
      return text + getCSSRuleText(item);
    };
    return reduce(styleSheet.cssRules, handler, '');
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
    return { id, type: NT.DOC_NODE };
  }

  if ($node instanceof DocumentType) {
    return {
      id,
      type: NT.DOC_TYPE_NODE,
      name: $node.name,
      publicId: $node.publicId,
      systemId: $node.systemId
    };
  }

  if ($node instanceof Element) {
    const attrs: Attrs = {};

    each($node.attributes, ({ name, value }) => {
      attrs[name] = rAttr(name, value);
    });

    if ($node instanceof HTMLLinkElement) {
      let styleSheet: CSSStyleSheet | undefined;

      each($doc.styleSheets, item => {
        if (item.href !== $node.href) return;
        styleSheet = item;
        return true;
      });

      const cssText = styleSheet ? getCSSText(styleSheet) : '';

      if (cssText) {
        attrs.rel = '';
        attrs.href = '';

        return [
          {
            id,
            type: NT.ELE_NODE,
            tagName: 'STYLE',
            attributes: attrs
          },
          {
            id: genId(),
            pId: id,
            type: NT.TEXT_NODE,
            textContent: rStyle(cssText)
          }
        ];
      }
    }

    if ($node instanceof HTMLInputElement) {
      const type = attrs.type;
      const value = $node.value;
      if (type !== 'radio' && type !== 'checkbox') {
        attrs.value = value;
      } else {
        attrs.checked = $node.checked;
      }
    }

    if (
      $node instanceof HTMLTextAreaElement ||
      $node instanceof HTMLSelectElement
    ) {
      const value = $node.value;
      attrs.value = value;
    } else if ($node instanceof HTMLOptionElement) {
      attrs.selected = $node.selected;
    }

    return {
      id,
      type: NT.ELE_NODE,
      tagName: getTagName($node),
      attributes: attrs,
      svg: isSVGElement($node)
    };
  }

  if ($node instanceof CDATASection) {
    return { id, type: NT.CDATA_NODE, textContent: '' };
  }

  if ($node instanceof Text) {
    const $parentNode = $node.parentNode;
    let textContent = $node.textContent;
    const style = $parentNode instanceof HTMLStyleElement;
    if (style && textContent) {
      textContent = rStyle(textContent);
    }
    return {
      id,
      type: NT.TEXT_NODE,
      textContent: textContent || '',
      style: style
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

  const walk = ($node: Node) => {
    const pId = $node.parentElement
      ? mirror.getId($node.parentElement)
      : undefined;

    const nId = $node.nextSibling ? mirror.getId($node.nextSibling) : undefined;

    const result = serialize($node, $doc);
    const list = Array.isArray(result) ? result : result ? [result] : [];

    adds.push(...list.map(i => ({ pId: pId, nId: nId, ...i })));

    if (list.length === 0) return;

    each($node.childNodes, walk, true);
  };

  walk($doc);

  return adds;
}
