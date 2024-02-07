import { ViewportResizeEmitArg } from '@mood/record';
import { ReceiveHandler } from '../types';

export const receiveToViewportResize: ReceiveHandler<ViewportResizeEmitArg> = (enevt, context) => {
  context.$iframe.width = `${enevt.width}px`;
  context.$iframe.height = `${enevt.height}px`;
};
