import { subscribeInput } from './input';
import { subscribeScroll } from './scroll';
import { subscribeViewportResize } from './viewport-resize';
import { subscribeMouseInteraction } from './mouse-interaction';
import { subscribeMouseMove } from './mouse-move';
import { subscribeMediaInteraction } from './media-interaction';
import { subscribeStyleSheet } from './style-sheet';
import { subscribeMutation } from './mutation';

import { EmitHandler } from '../types';

export function subscribe(emit: EmitHandler) {
  const unsubscribes = [
    subscribeMutation,
    subscribeMouseMove,
    subscribeMouseInteraction,
    subscribeScroll,
    subscribeViewportResize,
    subscribeInput,
    subscribeMediaInteraction,
    subscribeStyleSheet
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
