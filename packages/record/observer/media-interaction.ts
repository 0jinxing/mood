import {
  MediaInteractionCallback,
  MediaInteractions,
  mirror,
  TNode,
} from "@traps/common";
import { on } from "../utils";

function initMediaInteractionObserver(cb: MediaInteractionCallback) {
  const handler = (type: MediaInteractions) => (event: Event) => {
    const { target } = event;
    target && cb({ type, id: mirror.getId(target as TNode) });
  };
  const handlers = [on("play", handler("play")), on("pause", handler("pause"))];
  return () => {
    handlers.forEach((h) => h());
  };
}

export default initMediaInteractionObserver;
