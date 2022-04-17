export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  $target: Document | Window = document
): Function {
  const options = { capture: true, passive: true };
  $target.addEventListener(type, fn, options);
  return () => $target.removeEventListener(type, fn, options);
}
