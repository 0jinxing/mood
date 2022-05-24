import { reduce } from '@mood/utils';
import { rAttr } from './url';
import { Attrs } from '../types';
import { isCDATASection, isComment, isElement } from './is';

export function block($node: Node) {
  const script = isElement($node, 'script');

  const noscript = isElement($node, 'noscript');

  const cdata = isCDATASection($node);

  const comment = isComment($node);

  const rels = ['preload', 'modulepreload', 'manifest'];

  const preload = isElement($node, 'link') && rels.includes($node.getAttribute('rel') || '');

  return comment || script || noscript || preload || cdata;
}

export function next($node: Node) {
  let nextSibling = $node.nextSibling;

  while (nextSibling && block(nextSibling)) {
    nextSibling = nextSibling.nextSibling;
  }

  return nextSibling;
}

export function attrs($node: Element) {
  const attrs: Attrs = reduce(
    $node.attributes,
    (prev, { name, value }) => {
      return /^on[a-zA-Z]+$/.test(name) ? prev : { ...prev, [name]: rAttr(name, value) };
    },
    {}
  );

  if (isElement($node, 'input')) {
    const type = attrs.type;
    const value = $node.value;
    if (type === 'radio' || type === 'checkbox') attrs.checked = $node.checked;
    else attrs.value = value;
  } else if (isElement($node, 'textarea') || isElement($node, 'select')) {
    const value = $node.value;
    attrs.value = value;
  } else if (isElement($node, 'option')) {
    attrs.selected = $node.selected;
  }

  return attrs;
}

export function sheetToString(styleSheet: CSSStyleSheet): string {
  try {
    const handler = (text: string, item: CSSRule) => {
      const cssText = item instanceof CSSImportRule ? sheetToString(item.styleSheet) : item.cssText;
      return text + cssText;
    };
    return reduce(styleSheet.cssRules, handler, '');
  } catch {
    return '';
  }
}

export function pseudoToClass(cssText: string, pseudo: string) {
  const match: string[] = cssText.match(/[^{}]+{.*?}/gis) || [];

  const result = match
    .reduce((arr, str) => {
      const split = str.split(/([^{}])({)/) || [];

      const selector = split.slice(0, 2).join('');
      const rest = split.slice(2);

      const filter = selector
        .split(',')
        .filter(s => s.includes(pseudo))
        .map(s => s.replace(pseudo, '.' + pseudo));

      if (!filter.length) return arr;

      const text = filter.join(',') + rest.join('');

      return [...arr, text];
    }, [])
    .join('');

  return result;
}
