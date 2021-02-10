import { input } from './observer/input';
import { scroll } from './observer/scroll';
import { viewportResize } from './observer/viewport-resize';
import { mouseInteraction } from './observer/mouse-interaction';
import { mouseMove } from './observer/mouse-move';
import { mediaInteraction } from './observer/media-interaction';
import { styleSheet } from './observer/style-sheet';
import { mutation } from './observer/mutation';
import { offscreen } from './observer/offscreen';

import { EmitHandle } from './types';

export function combine(emit: EmitHandle) {
  const handlers = [
    mutation,
    mouseMove,
    mouseInteraction,
    scroll,
    viewportResize,
    input,
    mediaInteraction,
    styleSheet,
    offscreen
  ].map(o => o(emit));

  return () => {
    handlers.forEach(h => h());
  };
}
