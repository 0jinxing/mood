import { queryViewport, on, throttle } from '../utils';
import { SourceType } from '../constant';

export type SubscribeToViewportResizeArg = {
  source: SourceType.VIEWPORT_RESIZE;
  width: number;
  height: number;
};

export type SubscribeToViewportResizeEmit = (
  arg: SubscribeToViewportResizeArg
) => void;

export function subscribeToViewportResize(cb: SubscribeToViewportResizeEmit) {
  const source = SourceType.VIEWPORT_RESIZE;

  const updateDimension = throttle(
    () => cb({ source, ...queryViewport() }),
    200
  );

  return on('resize', updateDimension, window);
}
