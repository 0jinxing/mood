import { mirror, rAttr, rStyle } from './utils';
import { NodeTypes, Attrs, SNWithId } from './types';
import { reduce } from '@mood/utils';

let cursor = 0;
function genId(): number {
  return ++cursor;
}

function getCSSText(styleSheet: CSSStyleSheet): string {
  try {
    const handler = (text: string, item: CSSRule) => text + getCSSRuleText(item);
    return reduce(styleSheet.cssRules, handler, '');
  } catch {
    return '';
  }
}

function getCSSRuleText(rule: CSSRule): string {
  return rule instanceof CSSImportRule ? getCSSText(rule.styleSheet) : rule.cssText;
}

function isSVGElement($el: Element): $el is SVGElement {
  return /SVG/i.test($el.tagName) || $el instanceof SVGElement;
}

function isHTMLElement($el: Node): $el is Element {
  return $el instanceof Element;
}

export function serialize($node: Node, $doc: Document): SNWithId[] {
  const id = mirror.getId($node) || genId();
  mirror.set(id, $node);

  if ($node instanceof Document) {
    return [{ id, type: NodeTypes.DOC_NODE }];
  }

  if ($node instanceof DocumentType) {
    const { name, publicId, systemId } = $node;
    return [{ id, type: NodeTypes.DOC_TYPE_NODE, name, publicId, systemId }];
  }

  if ($node instanceof CDATASection) {
    return [{ id, type: NodeTypes.CDATA_NODE, textContent: '' }];
  }

  if ($node instanceof Text) {
    const style = $node.parentNode instanceof HTMLStyleElement;

    let textContent = $node.textContent || '';
    textContent = style ? rStyle(textContent) : textContent;

    return [{ id, type: NodeTypes.TEXT_NODE, textContent, style }];
  }

  if (!isHTMLElement($node) || $node instanceof HTMLScriptElement) {
    return [];
  }

  const attrs: Attrs = reduce(
    $node.attributes,
    (attrs, { name, value }) => Object.assign(attrs, { [name]: rAttr(name, value) }),
    {}
  );

  if ($node instanceof HTMLLinkElement) {
    const styleSheet = Array.from($doc.styleSheets).find(({ href }) => href === $node.href);

    const cssText = styleSheet ? getCSSText(styleSheet) : '';

    if (cssText) {
      return [
        { id, type: NodeTypes.ELE_NODE, tagName: 'STYLE', attrs },
        { id: genId(), pId: id, type: NodeTypes.TEXT_NODE, textContent: rStyle(cssText) }
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

  if ($node instanceof HTMLTextAreaElement || $node instanceof HTMLSelectElement) {
    const value = $node.value;
    attrs.value = value;
  }

  if ($node instanceof HTMLOptionElement) {
    attrs.selected = $node.selected;
  }

  return [
    { id, type: NodeTypes.ELE_NODE, tagName: $node.tagName, attrs, svg: isSVGElement($node) }
  ];
}
