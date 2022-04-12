import { SubscribeEmitArg, SourceType } from '@mood/record';
import { ReceiveContext, ReceiveHandler } from '../types';
import { receiveToInput } from './input';
import { receiveToMediaInteraction } from './media-interaction';
import { receiveToMouseInteraction } from './mouse-interaction';
import { receiveToMouseMove } from './mouse-move';
import { receiveToMutation } from './mutation';
import { receiveToViewportResize } from './viewport-resize';
import { receiveToScroll } from './scroll';
import { receiveToStyleSheet } from './style-sheet';
import { receiveToSelection } from './selection';
import { receiveToConsole } from './console';

export function applyIncremental(
  event: SubscribeEmitArg,
  context: ReceiveContext,
  sync: boolean
) {
  const handlerMap: { [key in SourceType]: ReceiveHandler } = {
    [SourceType.MUTATION]: receiveToMutation,
    [SourceType.MOUSE_MOVE]: receiveToMouseMove,
    [SourceType.MOUSE_INTERACTION]: receiveToMouseInteraction,
    [SourceType.SCROLL]: receiveToScroll,
    [SourceType.VIEWPORT_RESIZE]: receiveToViewportResize,
    [SourceType.INPUT]: receiveToInput,
    [SourceType.TOUCH_MOVE]: receiveToMouseMove,
    [SourceType.MEDIA_INTERACTION]: receiveToMediaInteraction,
    [SourceType.STYLE_SHEETRULE]: receiveToStyleSheet,
    [SourceType.SELECTION]: receiveToSelection,
    [SourceType.CONSOLE]: receiveToConsole
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
