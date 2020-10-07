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

import { EmitFn } from './types';

const observers = [
  mutationObserve,
  mouseMoveObserve,
  mouseInteractionObserve,
  scrollObserve,
  viewportResizeObserve,
  inputObserve,
  mediaInteractionObserve,
  styleSheetObserve,
  logObserve,
  xhrObserve,
  fetchObserve,
  errorObserve
];

export default function observe(emit: EmitFn) {
  const handlers = observers.map(o => o(emit));

  return () => {
    handlers.forEach(h => h());
  };
}
