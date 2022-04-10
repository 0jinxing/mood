import { ViewportResizeParam } from '@mood/record';
import { RecHandler } from '../types';

export const recViewportResize: RecHandler<ViewportResizeParam> = (
  enevt,
  context
) => {
  context.$iframe.width = `${enevt.width}px`;
  context.$iframe.height = `${enevt.height}px`;
};
