import { inputObserve } from './observer/input';
import { scrollObserve } from './observer/scroll';
import { viewportResizeObserve } from './observer/viewport-resize';
import { mouseInteractionObserve } from './observer/mouse-interaction';
import { mouseMoveObserve } from './observer/mouse-move';
import { mediaInteractionObserve } from './observer/media-interaction';
import { styleSheetObserve } from './observer/style-sheet';
import { mutationObserve } from './observer/mutation';

import { EmitHandle } from './types';

const observers = [
  mutationObserve,
  mouseMoveObserve,
  mouseInteractionObserve,
  scrollObserve,
  viewportResizeObserve,
  inputObserve,
  mediaInteractionObserve,
  styleSheetObserve
];

export function observe(emit: EmitHandle) {
  const handlers = observers.map(o => o(emit));

  return () => {
    handlers.forEach(h => h());
  };
}
