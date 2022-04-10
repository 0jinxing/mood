import { queryViewport, on, throttle } from '../utils';
import { IncSource } from '../constant';

export type ViewportResizeParam = {
  source: IncSource.VIEWPORT_RESIZE;
  width: number;
  height: number;
};

export type ViewportResizeCallback = (param: ViewportResizeParam) => void;

export function subViewportResize(cb: ViewportResizeCallback) {
  const source = IncSource.VIEWPORT_RESIZE;

  const updateDimension = throttle(
    () => cb({ source, ...queryViewport() }),
    200
  );

  return on('resize', updateDimension, window);
}
