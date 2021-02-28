import { input } from './input';
import { scroll } from './scroll';
import { viewportResize } from './viewport-resize';
import { mouseInteraction } from './mouse-interaction';
import { mouseMove } from './mouse-move';
import { mediaInteraction } from './media-interaction';
import { styleSheet } from './style-sheet';
import { mutation } from './mutation';

import { EmitHandler } from '../types';

export function subscribe(emit: EmitHandler) {
  const unsubscribes = [
    mutation,
    mouseMove,
    mouseInteraction,
    scroll,
    viewportResize,
    input,
    mediaInteraction,
    styleSheet
  ].map(o => o(emit));

  return () => {
    unsubscribes.forEach(u => u());
  };
}

export * from './input';
export * from './media-interaction';
export * from './mouse-interaction';
export * from './mouse-move';
export * from './mutation';
export * from './scroll';
export * from './style-sheet';
export * from './viewport-resize';
