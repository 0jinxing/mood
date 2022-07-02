export function isElement<K extends keyof HTMLElementTagNameMap>(
  $node?: Node | ChildNode | EventTarget | null,
  tagName?: K
): $node is HTMLElementTagNameMap[K] {
  if (!$node) return false;

  if ('nodeType' in $node && $node.nodeType === Node.ELEMENT_NODE) {
    const $el = <HTMLElement>$node;
    return !tagName || $el.tagName.toLowerCase() === tagName.toLowerCase();
  }
  return false;
}

export function isDocument($node: Node): $node is Document {
  return $node.nodeType === Node.DOCUMENT_NODE;
}

export function isComment($node: Node): $node is Comment {
  return $node.nodeType === Node.COMMENT_NODE;
}

export function isCDATASection($node: Node): $node is CDATASection {
  return $node.nodeType === Node.CDATA_SECTION_NODE;
}

export function isText($node: Node): $node is Text {
  return $node.nodeType === Node.TEXT_NODE;
}

export function isSVG($node: Element): $node is SVGElement {
  return Boolean($node.tagName === 'svg' || ($node as SVGElement).ownerSVGElement);
}
