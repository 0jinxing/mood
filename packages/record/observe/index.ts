import { InputEmitArg, observeInput } from './input';
import { ScrollEmitArg, observeScroll } from './scroll';
import { ViewportResizeEmitArg, observeViewportResize } from './viewport-resize';
import { MouseInteractionEmitArg, observeMouseInteraction } from './mouse-interaction';
import { MouseMoveEmitArg, observeMouseMove } from './mouse-move';
import { MediaInteractionEmitArg, observeMediaInteraction } from './media-interaction';
import { StyleSheetEmitArg, observeStyleSheet } from './style-sheet';
import { MutationEmitArg, observeMutation } from './mutation';
import { SelectionEmitArg, observeSelection } from './selection';
import { CanvasEmitArg, observeCanvas } from './canvas';
import { WebGLEmitArg, observeWebGL } from './webgl';
import { each } from '@mood/utils';
import { ObserveFunc } from '../types';

export type ObserveEmitArg =
  | MutationEmitArg
  | MouseMoveEmitArg
  | MouseInteractionEmitArg
  | ScrollEmitArg
  | ViewportResizeEmitArg
  | InputEmitArg
  | MediaInteractionEmitArg
  | StyleSheetEmitArg
  | SelectionEmitArg
  | CanvasEmitArg
  | WebGLEmitArg;

export const observe: ObserveFunc<ObserveEmitArg> = (...args) => {
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
  ].map(o => o(...args));

  return () => each(unsubscribes, u => u());
};

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
