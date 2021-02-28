import { queryWindowHeight, queryWindowWidth, on, throttle } from '../utils';
import { IncrementalSource } from '../constant';

export type ViewportResizeParam = {
  source: IncrementalSource.VIEWPORT_RESIZE;
  width: number;
  height: number;
};

export type ViewportResizeCallback = (param: ViewportResizeParam) => void;

export function viewportResize(cb: ViewportResizeCallback) {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ source: IncrementalSource.VIEWPORT_RESIZE, height, width });
  }, 200);
  return on('resize', updateDimension, window);
}
