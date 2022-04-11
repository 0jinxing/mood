import { IncrementalParam, SOURCE } from '@mood/record';
import { RecCtx, RecHandler } from '../types';
import { receInput } from './input';
import { recMediaInteraction } from './media-interaction';
import { recMouseInteraction } from './mouse-interaction';
import { recMouseMove } from './mouse-move';
import { recMutation } from './mutation';
import { recViewportResize } from './viewport-resize';
import { recScroll } from './scroll';
import { recStyleSheet } from './style-sheet';
import { recSelection } from './selection';
import { recConsole } from './console';

export function applyIncremental(
  event: IncrementalParam,
  context: RecCtx,
  sync: boolean
) {
  const handlerMap: { [key in SOURCE]: RecHandler } = {
    [SOURCE.MUTATION]: recMutation,
    [SOURCE.MOUSE_MOVE]: recMouseMove,
    [SOURCE.MOUSE_INTERACTION]: recMouseInteraction,
    [SOURCE.SCROLL]: recScroll,
    [SOURCE.VIEWPORT_RESIZE]: recViewportResize,
    [SOURCE.INPUT]: receInput,
    [SOURCE.TOUCH_MOVE]: recMouseMove,
    [SOURCE.MEDIA_INTERACTION]: recMediaInteraction,
    [SOURCE.STYLE_SHEETRULE]: recStyleSheet,
    [SOURCE.SELECTION]: recSelection,
    [SOURCE.CONSOLE]: recConsole
  };

  handlerMap[event.source](event, context, sync);
}

export * from './input';
export * from './media-interaction';
export * from './mouse-interaction';
export * from './mouse-move';
export * from './mutation';
export * from './viewport-resize';
export * from './scroll';
export * from './style-sheet';
export * from './selection';
export * from './console';
