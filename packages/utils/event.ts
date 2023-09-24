type TargetElementType = Document | Window | HTMLElement;

type EventMapForTarget<T extends TargetElementType> = T extends Document
  ? DocumentEventMap
  : T extends Window
  ? WindowEventMap
  : HTMLElementEventMap;

type EventTypeFromEventMap<
  T extends TargetElementType,
  K extends keyof EventMapForTarget<T>
> = EventMapForTarget<T>[K];

export function on<T extends TargetElementType, K extends keyof EventMapForTarget<T>>(
  $target: T,
  type: K,
  fn: (ev: EventTypeFromEventMap<T, K>) => void,
  options?: boolean | AddEventListenerOptions
): () => void;

export function on<T extends EventTarget>(
  $target: T,
  type: string,
  fn: EventListener,
  options?: boolean | AddEventListenerOptions
): () => void;

export function on<T extends TargetElementType>(
  $target: T,
  type: string,
  fn: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): () => void {
  if (options === undefined) {
    options = { capture: true, passive: true };
  }
  $target.addEventListener(type, fn, options);
  return () => $target.removeEventListener(type, fn as EventListener, options);
}
