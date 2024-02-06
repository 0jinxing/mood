import { $$input } from './input';
import { $$scroll } from './scroll';
import { $$viewportResize } from './viewport-resize';
import { $$mouseInteraction } from './mouse-interaction';
import { $$ouseMove } from './mouse-move';
import { $$mediaInteraction } from './media-interaction';
import { $$styleSheet } from './style-sheet';
import { $$mutation } from './mutation';
import { $$selection } from './selection';
import { $$canvas2D } from './canvas';

import { EmitHandler } from '../types';
import { each } from '@mood/utils';

export function subscribe(emit: EmitHandler) {
  const unsubscribe = [
    $$mutation,
    $$ouseMove,
    $$mouseInteraction,
    $$scroll,
    $$viewportResize,
    $$input,
    $$mediaInteraction,
    $$styleSheet,
    $$selection,
    $$canvas2D
  ].map(o => o(emit));

  return () => each(unsubscribe, u => u());
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
export * from './canvas';
