import { queryWindowHeight, queryWindowWidth, on, throttle } from '../utils';
import { IncrementalSource } from '../constant';

export type ViewportResizeData = {
  source: IncrementalSource.VIEWPORT_RESIZE;
  width: number;
  height: number;
};

export type ViewportResizeCb = (param: ViewportResizeData) => void;

export function viewportResizeObserve(cb: ViewportResizeCb) {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ source: IncrementalSource.VIEWPORT_RESIZE, height, width });
  }, 200);
  return on('resize', updateDimension, window);
}
