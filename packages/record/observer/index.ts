import { ObserverParam, HooksParam, ListenerHandler } from "@traps/common";

import initInputObserver from "./input";
import initScrollObserver from "./scroll";
import initViewportResizeObserver from "./viewport-resize";
import initMouseInteractionObserver from "./mouse-interaction";
import initMouseMoveObserver from "./mouse-move";
import initMediaInteractionObserver from "./media-interaction";
import initStyleSheetObserver from "./style-sheet";
import initMutationObserver from "./mutation";

export function mergeHooks(observer: ObserverParam, hooks: HooksParam) {
  Object.keys(hooks).forEach((key: keyof HooksParam) => {
    observer[key] = (...args: any[]) => {
      hooks[key]?.apply(null, args);
      observer[key].apply(null, args);
    };
  });
}

export default function initObservers(
  observer: ObserverParam,
  hooks: HooksParam = {}
): ListenerHandler {
  mergeHooks(observer, hooks);
  const {
    mutation,
    mousemove,
    mouseInteraction,
    scroll,
    viewportResize,
    input,
    mediaInteraction,
    styleSheetRule,
  } = observer;

  const mutationObserver = initMutationObserver(mutation);
  const mousemoveHandler = initMouseMoveObserver(mousemove);
  const mouseInteractionHandler = initMouseInteractionObserver(
    mouseInteraction
  );
  const scrollHandler = initScrollObserver(scroll);
  const viewportResizeHandler = initViewportResizeObserver(viewportResize);
  const inputHandler = initInputObserver(input);
  const mediaInteractionHandler = initMediaInteractionObserver(
    mediaInteraction
  );
  const styleSheetObserver = initStyleSheetObserver(styleSheetRule);

  return () => {
    mutationObserver.disconnect();
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
    mediaInteractionHandler();
    styleSheetObserver();
  };
}
