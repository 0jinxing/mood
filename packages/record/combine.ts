import inputObserve from './observer/input';
import scrollObserve from './observer/scroll';
import viewportResizeObserve from './observer/viewport-resize';
import mouseInteractionObserve from './observer/mouse-interaction';
import mouseMoveObserve from './observer/mouse-move';
import mediaInteractionObserve from './observer/media-interaction';
import styleSheetObserve from './observer/style-sheet';
import mutationObserve from './observer/mutation';
import xhrObserve from './observer/request-xhr';
import fetchObserve from './observer/request-fetch';
import logObserve from './observer/log';
import errorObserve from './observer/global-error';

import { ObserveParam, HooksParam } from './types';

export function mergeHooks(observer: ObserveParam, hooks: HooksParam) {
  Object.keys(hooks).forEach((key: keyof HooksParam) => {
    observer[key] = (...args: any[]) => {
      observer[key].apply(null, args);
      // apply hook fn
      hooks[key]?.apply(null, args);
    };
  });
}

export default function observe(
  observer: ObserveParam,
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
    log,
    xhrRequest,
    fetchRequest,
    globalError
  } = observer;

  const mutationObserver = mutationObserve(mutation);
  const mousemoveHandler = mouseMoveObserve(mousemove);
  const mouseInteractionHandler = mouseInteractionObserve(mouseInteraction);
  const scrollHandler = scrollObserve(scroll);
  const viewportResizeHandler = viewportResizeObserve(viewportResize);
  const inputHandler = inputObserve(input);
  const mediaInteractionHandler = mediaInteractionObserve(mediaInteraction);
  const styleSheetObserver = styleSheetObserve(styleSheetRule);
  const logObserver = logObserve(log);
  const xhrObserver = xhrObserve(xhrRequest);
  const fetchObserver = fetchObserve(fetchRequest);
  const errorObserver = errorObserve(globalError);

  return () => {
    mutationObserver();
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
