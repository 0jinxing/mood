import { SubscribeToViewportResizeArg } from '@mood/record';
import { ReceiveHandler } from '../types';

export const receiveToViewportResize: ReceiveHandler<SubscribeToViewportResizeArg> = (
  enevt,
  context
) => {
  context.$iframe.width = `${enevt.width}px`;
  context.$iframe.height = `${enevt.height}px`;
};
