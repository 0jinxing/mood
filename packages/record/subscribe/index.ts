import { subInput } from './input';
import { subScroll } from './scroll';
import { subViewportResize } from './viewport-resize';
import { subMouseInteraction } from './mouse-interaction';
import { subMouseMove } from './mouse-move';
import { subMediaInteraction } from './media-interaction';
import { subStyleSheet } from './style-sheet';
import { subMutation } from './mutation';

import { EmitHandler } from '../types';

export function subscribe(emit: EmitHandler) {
  const unsubscribes = [
    subMutation,
    subMouseMove,
    subMouseInteraction,
    subScroll,
    subViewportResize,
    subInput,
    subMediaInteraction,
    subStyleSheet
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
