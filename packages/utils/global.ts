function getGlobalFromEventTarget(node: Document | HTMLElement | Window) {
  if ('defaultView' in node && node.defaultView) {
    // node is document
    return node.defaultView;
  } else if ('ownerDocument' in node && node.ownerDocument && node.ownerDocument.defaultView) {
    // node is a DOM node
    return node.ownerDocument.defaultView;
  } else if ('window' in node) {
    // node is window
    return node.window;
  }
  return window;
}
