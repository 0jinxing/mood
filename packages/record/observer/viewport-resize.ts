import { queryWindowHeight, queryWindowWidth, on, throttle } from '../utils';

export type ViewportResizeCbParam = {
  width: number;
  height: number;
};

export type ViewportResizeCb = (param: ViewportResizeCbParam) => void;

function viewportResizeObserve(cb: ViewportResizeCb) {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ height, width });
  }, 200);
  return on('resize', updateDimension, window);
}

export default viewportResizeObserve;
