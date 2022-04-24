import { subscribeToInput } from './input';
import { subscribeToScroll } from './scroll';
import { subscribeToViewportResize } from './viewport-resize';
import { subscribeToMouseInteraction } from './mouse-interaction';
import { subscribeToMouseMove } from './mouse-move';
import { subscribeToMediaInteraction } from './media-interaction';
import { subscribeToStyleSheet } from './style-sheet';
import { subscribeToMutation } from './mutation';
import { subscribeToSelection } from './selection';

import { EmitHandler } from '../types';
import { each } from '@mood/utils';

export function subscribe(emit: EmitHandler) {
  const unsubscribes = [
    subscribeToMutation,
    subscribeToMouseMove,
    subscribeToMouseInteraction,
    subscribeToScroll,
    subscribeToViewportResize,
    subscribeToInput,
    subscribeToMediaInteraction,
    subscribeToStyleSheet,
    subscribeToSelection
  ].map(o => o(emit));

  return () => each(unsubscribes, u => u());
}

export * from './input';
export * from './media-interaction';
export * from './mouse-interaction';
export * from './mouse-move';
export * from './mutation';
export * from './scroll';
export * from './style-sheet';
export * from './viewport-resize';
export * from './selection';
