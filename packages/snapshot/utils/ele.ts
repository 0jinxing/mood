export function isIgnoreNode($node: Node) {
  const comment = $node instanceof Comment;

  const script = $node instanceof HTMLScriptElement;

  const noscript = $node instanceof HTMLElement && /noscript/i.test($node.tagName);

  const preload =
    $node instanceof HTMLLinkElement &&
    ['preload', 'modulepreload'].includes($node.getAttribute('rel') || '');

  return comment || script || noscript || preload;
}

export function getNextSibling($node: Node) {
  let nextSibling = $node.nextSibling;

  while (nextSibling && isIgnoreNode(nextSibling)) {
    nextSibling = nextSibling.nextSibling;
  }

  return nextSibling;
}
