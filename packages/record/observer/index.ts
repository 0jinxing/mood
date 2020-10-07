import initInputObserver from './input';
import initScrollObserver from './scroll';
import initViewportResizeObserver from './viewport-resize';
import initMouseInteractionObserver from './mouse-interaction';
import initMouseMoveObserver from './mouse-move';
import initMediaInteractionObserver from './media-interaction';
import initStyleSheetObserver from './style-sheet';
import initMutationObserver from './mutation';
import initXhrObserver from './xhr';
import initFetchObserver from './fetch';
import initLogObserver from './log';
import initErrorObserver from './error';

import { ObserverParam, HooksParam } from '../types';

export function mergeHooks(observer: ObserverParam, hooks: HooksParam) {
  Object.keys(hooks).forEach((key: keyof HooksParam) => {
    observer[key] = (...args: any[]) => {
      observer[key].apply(null, args);
      // apply hook fn
      hooks[key]?.apply(null, args);
    };
  });
}

export default function initObservers(
  observer: ObserverParam,
  hooks: HooksParam = {}
): Function {
  // apply hooks
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

    xhr,
    fetch,
    log,
    error
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

  const xhrObserver = initXhrObserver(xhr);

  const fetchObserver = initFetchObserver(fetch);

  const logObserver = initLogObserver(log);

  const errorObserver = initErrorObserver(error);

  return () => {
    mutationObserver.disconnect();
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
    mediaInteractionHandler();
    styleSheetObserver();

    xhrObserver();
    fetchObserver();
    logObserver();
    errorObserver();
  };
}
