import {
  ScrollCallback,
  ListenerHandler,
  throttle,
  mirror,
  TNode,
} from "@traps/common";
import { on } from "../utils";

function initScrollObserver(cb: ScrollCallback): ListenerHandler {
  const updatePosition = throttle<UIEvent>((event) => {
    const { target } = event;
    const id = mirror.getId(target as TNode);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === document) $scroll = document.scrollingElement as HTMLElement;
    cb({ id, x: $scroll.scrollLeft, y: $scroll.scrollTop });
  }, 100);
  return on("scroll", updatePosition);
}

export default initScrollObserver;
