import { queryWindowHeight, queryWindowWidth, on, throttle } from "../utils";

import { ViewportResizeCallback, ListenerHandler } from "../types";

function initViewportResizeObserver(cb: ViewportResizeCallback): ListenerHandler {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ height, width });
  }, 200);
  return on("resize", updateDimension, window);
}

export default initViewportResizeObserver;
