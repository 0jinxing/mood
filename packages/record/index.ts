import { snapshot } from "@traps/snapshot";
import { mirror } from "@traps/common";
import {
  TEvent,
  TEventWithTime,
  ListenerHandler,
  RecordOptions,
  EventType,
  IncrementalSource,
} from "@traps/common";
import initObservers from "./observer";

import { on, queryWindowHeight, queryWindowWidth } from "./utils";

function wrappedEvent(e: TEvent): TEventWithTime {
  return { ...e, timestamp: Date.now() };
}

let wrappedEmit!: (e: TEventWithTime, isCheckout?: true) => void;
let wrappedEmitWithTime!: (e: TEvent, isCheckout?: true) => void;

function record(options: RecordOptions<TEvent>): ListenerHandler {
  const { emit, hooks, pack, checkoutEveryNms, checkoutEveryNth } = options;

  let lastFullSnapshotEvent: TEventWithTime;
  let incrementalSnapshotCount = 0;

  wrappedEmit = (event: TEventWithTime, isCheckout?: true) => {
    emit(pack ? pack(event) : event, isCheckout);
    if (event.type === EventType.FULL_SNAPSHOT) {
      lastFullSnapshotEvent = event;
      incrementalSnapshotCount = 0;
    } else if (event.type === EventType.INCREMENTAL_SNAPSHOT) {
      incrementalSnapshotCount += 1;
      const exceedCount =
        checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime =
        checkoutEveryNms &&
        event.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
      if (exceedCount || exceedTime) {
        takeFullSnapshot(true);
      }
    }
  };

  wrappedEmitWithTime = (event: TEvent, isCheckout?: true) => {
    wrappedEmit(wrappedEvent(event), isCheckout);
  };

  const takeFullSnapshot = (isCheckout?: true) => {
    wrappedEmitWithTime(
      {
        type: EventType.META,
        data: {
          href: window.location.href,
          width: queryWindowWidth(),
          height: queryWindowHeight(),
        },
      },
      isCheckout
    );
    const [node, idNodeMap] = snapshot(document);
    if (!node) {
      console.warn("Failed to snapshot the document");
      throw new Error("Failed to snapshot the document");
    }
    mirror.idNodeMap = idNodeMap;

    wrappedEmitWithTime({
      type: EventType.FULL_SNAPSHOT,
      data: {
        node,
        initialOffset: {
          left:
            window.pageXOffset !== undefined
              ? window.pageXOffset
              : document?.documentElement.scrollLeft ||
                document?.body?.parentElement?.scrollLeft ||
                document?.body.scrollLeft ||
                0,
          top:
            window.pageYOffset !== undefined
              ? window.pageYOffset
              : document?.documentElement.scrollTop ||
                document?.body?.parentElement?.scrollTop ||
                document?.body.scrollTop ||
                0,
        },
      },
    });
  };

  const handlers: ListenerHandler[] = [];
  handlers.push(
    on("DOMContentLoaded", () => {
      wrappedEmitWithTime({ type: EventType.DOM_CONTENT_LOADED, data: {} });
    })
  );

  const initial = () => {
    takeFullSnapshot();
    handlers.push(
      initObservers(
        {
          mutation: (m) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.MUTATION, ...m },
            });
          },
          mousemove: (positions, source) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source, positions },
            });
          },
          mouseInteraction: (param) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.MOUSE_INTERACTION, ...param },
            });
          },

          scroll: (position) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.SCROLL, ...position },
            });
          },

          viewportResize: (dimention) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.VIEWPORT_RESIZE, ...dimention },
            });
          },

          input: (param) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.INPUT, ...param },
            });
          },

          mediaInteraction: (param) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.MEDIA_INTERACTION, ...param },
            });
          },

          styleSheetRule: (param) => {
            wrappedEmitWithTime({
              type: EventType.INCREMENTAL_SNAPSHOT,
              data: { source: IncrementalSource.STYLE_SHEETRULE, ...param },
            });
          },
        },
        hooks
      )
    );
  };

  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    initial();
  } else {
    handlers.push(
      on(
        "load",
        () => {
          wrappedEmitWithTime({ type: EventType.LOAD, data: {} });
          initial();
        },
        window
      )
    );
  }

  return () => {
    handlers.forEach((h) => h());
  };
}

export function addCustomEvent<T>(tag: string, payload: T) {
  if (!wrappedEmitWithTime) {
    throw new Error("please add custom event after start recording");
  }
  wrappedEmitWithTime({ type: EventType.CUSTOM, data: { tag, payload } });
}

export default record;