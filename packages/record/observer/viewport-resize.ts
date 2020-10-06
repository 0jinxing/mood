import { queryWindowHeight, queryWindowWidth, on, throttle } from '../utils';

export type ViewportResizeDimention = {
  width: number;
  height: number;
};

export type ViewportResizeCallback = (
  dimention: ViewportResizeDimention
) => void;

function initViewportResizeObserver(cb: ViewportResizeCallback): Function {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ height, width });
  }, 200);
  return on('resize', updateDimension, window);
}

export default initViewportResizeObserver;
