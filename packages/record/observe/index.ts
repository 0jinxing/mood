import { observeInput } from './input';
import { observeScroll } from './scroll';
import { observeViewportResize } from './viewport-resize';
import { observeMouseInteraction } from './mouse-interaction';
import { observeMouseMove } from './mouse-move';
import { observeMediaInteraction } from './media-interaction';
import { observeStyleSheet } from './style-sheet';
import { observeMutation } from './mutation';
import { observeSelection } from './selection';
import { observeCanvas } from './canvas';
import { observeWebGL } from './webgl';

import { EmitHandler } from '../types';
import { each } from '@mood/utils';
import { Mirror } from '@mood/snapshot';

export function observe(emit: EmitHandler, doc: Document, mirror: Mirror) {
  const unsubscribes = [
    observeMutation,
    observeMouseMove,
    observeMouseInteraction,
    observeScroll,
    observeViewportResize,
    observeInput,
    observeMediaInteraction,
    observeStyleSheet,
    observeSelection,
    observeCanvas,
    observeWebGL
  ].map(o => o(emit, { doc, mirror }));

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
export * from './canvas';
export * from './webgl';
