import { ExtNode } from './types';

export function isExtNode($node: Node): $node is ExtNode {
  return '__sn' in $node;
}

export function isSVGElement($el: Element): $el is SVGElement {
  return /SVG/i.test($el.tagName) || $el instanceof SVGElement;
}
