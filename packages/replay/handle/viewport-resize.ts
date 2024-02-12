import { ViewportResizeEmitArg } from '@mood/record';
import { EmitHandler } from '../types';

export const handleViewportResizeEmit: EmitHandler<ViewportResizeEmitArg> = (enevt, context) => {
  context.$iframe.width = `${enevt.width}px`;
  context.$iframe.height = `${enevt.height}px`;
};
