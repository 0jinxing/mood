import { mirror, rAttr, rStyle } from './utils';
import { NodeType, Attrs, SNWithId } from './types';
import { reduce, each } from '@mood/utils';
import { getNextSibling, isIgnoreNode } from './utils/ele';

let id = 0;
function genId(): number {
  return ++id;
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
  return rule instanceof CSSImportRule ? getCSSText(rule.styleSheet) : rule.cssText;
}

function pickCssText(cssText: string) {
  const match = cssText.match(/[^{}]+:hover([^{}]*{[^{}]+})/gi) || [];

  return match.reduce((result, current) => {
    return result;
  }, '');
}

export function serialize($node: Node, $doc: Document): SNWithId[] {
  if (isIgnoreNode($node)) return [];

  const id = mirror.getId($node) || genId();

  mirror.set(id, $node);

  if ($node instanceof Document) {
    return [{ id, type: NodeType.DOC_NODE, title: $node.title }];
  }

  if ($node instanceof Text) {
    const style = $node.parentNode instanceof HTMLStyleElement;

    const textContent =
      style && $node.textContent ? rStyle($node.textContent) : $node.textContent || '';

    return [{ id, type: NodeType.TEXT_NODE, textContent, style }];
  }

  if ($node instanceof Element) {
    const attrs: Attrs = reduce(
      $node.attributes,
      (prev, { name, value }) => {
        if (/^on[a-zA-Z]+$/.test(name)) return prev;
        return { ...prev, [name]: rAttr(name, value) };
      },
      {}
    );

    if ($node instanceof HTMLLinkElement) {
      const styleSheet = Array.from($doc.styleSheets).find(i => i.href === $node.href);

      const cssText = styleSheet ? getCSSText(styleSheet) : '';

      if (cssText) {
        attrs.rel = '';
        attrs.href = '';

        return [
          { id, type: NodeType.ELE_NODE, tagName: 'STYLE', attrs: attrs },
          { id: genId(), pId: id, type: NodeType.TEXT_NODE, textContent: rStyle(cssText) }
        ];
      }
    }

    if ($node instanceof HTMLInputElement) {
      const type = attrs.type;
      const value = $node.value;

      if (type === 'radio' || type === 'checkbox') attrs.checked = $node.checked;
      else attrs.value = value;
    }

    if ($node instanceof HTMLTextAreaElement || $node instanceof HTMLSelectElement) {
      const value = $node.value;
      attrs.value = value;
    }

    if ($node instanceof HTMLOptionElement) {
      attrs.selected = $node.selected;
    }

    return [{ id, type: NodeType.ELE_NODE, tagName: $node.tagName, attrs: attrs }];
  }

  return [];
}

export function snapshot($doc: Document): SNWithId[] {
  const adds: SNWithId[] = [];

  const walk = ($node: Node) => {
    const pId = $node.parentElement ? mirror.getId($node.parentElement) : undefined;

    const $nextSibling = getNextSibling($node);

    const nId = $nextSibling ? mirror.getId($nextSibling) : undefined;

    const result = serialize($node, $doc);

    adds.push(...result.map(i => ({ pId, nId, ...i })));

    result.length && each($node.childNodes, walk, true);
  };

  walk($doc);

  return adds;
}
