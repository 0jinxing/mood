import {
  ListenerHandler,
  ViewportResizeCallback,
  throttle,
} from "@traps/common";
import { queryWindowHeight, queryWindowWidth, on } from "../utils";

function initViewportResizeObserver(cb: ViewportResizeCallback): ListenerHandler {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ height, width });
  }, 200);
  return on("resize", updateDimension, window);
}

export default initViewportResizeObserver;
