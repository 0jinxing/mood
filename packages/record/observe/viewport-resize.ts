import { on, throttle } from '@mood/utils';
import { ObserveFunc, ST } from '../types';
import { queryViewport } from '../utils';

export type ViewportResizeEmitArg = {
  source: ST.VIEWPORT_RESIZE;
  width: number;
  height: number;
};

export const observeViewportResize: ObserveFunc<ViewportResizeEmitArg> = (cb, { doc }) => {
  const source = ST.VIEWPORT_RESIZE;

  const updateDimension = throttle(() => cb({ source, ...queryViewport(doc) }), 200);

  return on(window, 'resize', updateDimension);
};
