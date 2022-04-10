import { ViewportResizeParam } from '@mood/record';
import { ReceiveContext } from '../types';

export function receiveViewportResize(
  enevt: ViewportResizeParam,
  context: ReceiveContext
) {
  context.$iframe.width = `${enevt.width}px`;
  context.$iframe.height = `${enevt.height}px`;
}
