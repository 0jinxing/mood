import { snapshot } from '@mood/snapshot';

import initObservers from './observer';
import { on, queryWindowHeight, queryWindowWidth } from './utils';

import { TEvent, TEventWithTime, HooksParam, IncrementalData } from './types';
import { EventType, IncrementalSource } from './constant';

export type RecordOptions<T> = {
  emit: (e: T | string, isCheckout?: true) => void;
  hooks?: HooksParam;
  checkoutEveryNth?: number;
  checkoutEveryNms?: number;
};

function withTimestamp(e: TEvent): TEventWithTime {
  return { ...e, timestamp: Date.now() };
}

let wrappedEmit!: (e: TEventWithTime, isCheckout?: true) => void;
let wrappedEmitWithTime!: (e: TEvent, isCheckout?: true) => void;

function record(options: RecordOptions<TEvent>) {
  const { emit, hooks, checkoutEveryNms, checkoutEveryNth } = options;

  let lastFullSnapshotEvent: TEventWithTime;
  let incrementalSnapshotCount = 0;

  wrappedEmit = (event: TEventWithTime, isCheckout?: true) => {
    emit(event, isCheckout);

    if (event.type === EventType.FULL_SNAPSHOT) {
      lastFullSnapshotEvent = event;
      incrementalSnapshotCount = 0;
    }

    if (event.type === EventType.INCREMENTAL_SNAPSHOT) {
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
    wrappedEmit(withTimestamp(event), isCheckout);
  };

  const incEmitWithTime = (data: IncrementalData) => {
    wrappedEmitWithTime({ type: EventType.INCREMENTAL_SNAPSHOT, data });
  };

  const takeFullSnapshot = (isCheckout?: true) => {
    wrappedEmitWithTime(
      {
        type: EventType.META,
        data: {
          href: location.href,
          width: queryWindowWidth(),
          height: queryWindowHeight()
        }
      },
      isCheckout
    );
    const adds = snapshot(document);

    if (!adds) {
      console.warn('Failed to snapshot the document');
      throw new Error('Failed to snapshot the document');
    }

    wrappedEmitWithTime({
      type: EventType.FULL_SNAPSHOT,
      data: {
        adds,
        offset: {
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
                0
        }
      }
    });
  };

  const handlers: Function[] = [];
  handlers.push(
    on('DOMContentLoaded', () => {
      wrappedEmitWithTime({ type: EventType.DOM_CONTENT_LOADED });
    })
  );

  const initial = () => {
    takeFullSnapshot();
    handlers.push(
      initObservers(
        {
          mutation: m => {
            incEmitWithTime({ source: IncrementalSource.MUTATION, ...m });
          },

          mousemove: (positions, source) => {
            incEmitWithTime({ source, positions });
          },

          mouseInteraction: params => {
            incEmitWithTime({
              source: IncrementalSource.MOUSE_INTERACTION,
              ...params
            });
          },

          scroll: position => {
            incEmitWithTime({ source: IncrementalSource.SCROLL, ...position });
          },

          viewportResize: dimention => {
            incEmitWithTime({
              source: IncrementalSource.VIEWPORT_RESIZE,
              ...dimention
            });
          },

          input: params => {
            incEmitWithTime({ source: IncrementalSource.INPUT, ...params });
          },

          mediaInteraction: params => {
            incEmitWithTime({
              source: IncrementalSource.MEDIA_INTERACTION,
              ...params
            });
          },

          styleSheetRule: params => {
            incEmitWithTime({
              source: IncrementalSource.STYLE_SHEETRULE,
              ...params
            });
          },

          xhr: params => {
            incEmitWithTime({ source: IncrementalSource.XHR, ...params });
          },

          fetch: params => {
            incEmitWithTime({ source: IncrementalSource.FETCH, ...params });
          },

          log: params => {
            incEmitWithTime({ source: IncrementalSource.LOG, ...params });
          },

          error: params => {
            incEmitWithTime({ source: IncrementalSource.ERROR, ...params });
          }
        },
        hooks
      )
    );
  };

  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    initial();
  } else {
    handlers.push(
      on(
        'load',
        () => {
          wrappedEmitWithTime({ type: EventType.LOADED });
          initial();
        },
        window
      )
    );
  }

  return () => {
    handlers.forEach(h => h());
  };
}

export function addCustomEvent<T>(tag: string, payload: T) {
  if (!wrappedEmitWithTime) {
    throw new Error('please add custom event after start recording');
  }
  wrappedEmitWithTime({ type: EventType.CUSTOM, data: { tag, payload } });
}

export * from './types';

export default record;
