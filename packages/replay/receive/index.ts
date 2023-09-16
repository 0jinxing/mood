import { SubscribeEmitArg, SourceTypes } from '@mood/record';
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

export function applyIncremental(event: SubscribeEmitArg, context: ReceiveContext, sync: boolean) {
  const handlerMap: { [key in SourceTypes]: ReceiveHandler } = {
    [SourceTypes.MUTATION]: receiveToMutation,
    [SourceTypes.MOUSE_MOVE]: receiveToMouseMove,
    [SourceTypes.MOUSE_INTERACTION]: receiveToMouseInteraction,
    [SourceTypes.SCROLL]: receiveToScroll,
    [SourceTypes.VIEWPORT_RESIZE]: receiveToViewportResize,
    [SourceTypes.INPUT]: receiveToInput,
    [SourceTypes.TOUCH_MOVE]: receiveToMouseMove,
    [SourceTypes.MEDIA_INTERACTION]: receiveToMediaInteraction,
    [SourceTypes.STYLE_SHEETRULE]: receiveToStyleSheet,
    [SourceTypes.SELECTION]: receiveToSelection
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
