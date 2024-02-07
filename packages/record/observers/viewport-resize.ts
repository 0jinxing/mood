import { on, throttle } from '@mood/utils';
import { SourceTypes } from '../types';
import { queryViewport } from '../utils';

export type ViewportResizeEmitArg = {
  source: SourceTypes.VIEWPORT_RESIZE;
  width: number;
  height: number;
};

export type SubscribeToViewportResizeHandler = (arg: ViewportResizeEmitArg) => void;

export function $$viewportResize(cb: SubscribeToViewportResizeHandler) {
  const source = SourceTypes.VIEWPORT_RESIZE;

  const updateDimension = throttle(() => cb({ source, ...queryViewport() }), 200);

  return on(window, 'resize', updateDimension);
}
