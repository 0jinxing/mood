import { IncrementalSnapshotEvent, IncSource } from '@mood/record';
import { ReceiveContext } from '../types';
import { receiveInput } from './input';
import { receiveMediaInteraction } from './media-interaction';
import { receiveMouseInteraction } from './mouse-interaction';
import { receiveMouseMove } from './mouse-move';
import { receiveMutation } from './mutation';
import { receiveViewportResize } from './viewport-resize';
import { receiveScroll } from './scroll';
import { receiveStyleSheet } from './style-sheet';

export function applyIncremental(
  event: IncrementalSnapshotEvent,
  context: ReceiveContext,
  sync: boolean
) {
  const handlers = {
    [IncSource.MUTATION]: receiveMutation,
    [IncSource.MOUSE_MOVE]: receiveMouseMove,
    [IncSource.MOUSE_INTERACTION]: receiveMouseInteraction,
    [IncSource.SCROLL]: receiveScroll,
    [IncSource.VIEWPORT_RESIZE]: receiveViewportResize,
    [IncSource.INPUT]: receiveInput,
    [IncSource.TOUCH_MOVE]: receiveMouseMove,
    [IncSource.MEDIA_INTERACTION]: receiveMediaInteraction,
    [IncSource.STYLE_SHEETRULE]: receiveStyleSheet
  } as const;

  handlers[event.source]?.(event as any, context, sync);
}
