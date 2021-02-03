import { snapshot } from '@mood/snapshot';

import { observe } from './combine';
import { on, queryWindowHeight, queryWindowWidth } from './utils';

import { RecordEvent, RecordEventWithTime, EmitHandle } from './types';
import { EventType } from './constant';

export type RecordOptions = {
  emit: (e: RecordEventWithTime, isCheckout?: true) => void;
  checkoutEveryNth?: number;
  checkoutEveryNms?: number;
};

function withTimestamp(e: RecordEvent): RecordEventWithTime {
  return { ...e, timestamp: Date.now() };
}

let wrappedEmit!: (e: RecordEventWithTime, isCheckout?: true) => void;
let wrappedEmitWithTime!: (e: RecordEvent, isCheckout?: true) => void;

export function record(options: RecordOptions) {
  const { emit, checkoutEveryNms, checkoutEveryNth } = options;

  let lastFullSnapshotEvent: RecordEventWithTime;
  let incrementalSnapshotCount = 0;

  wrappedEmit = (event: RecordEventWithTime, isCheckout?: true) => {
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

  wrappedEmitWithTime = (event: RecordEvent, isCheckout?: true) => {
    wrappedEmit(withTimestamp(event), isCheckout);
  };

  const incEmitWithTime: EmitHandle = data => {
    wrappedEmitWithTime({ type: EventType.INCREMENTAL_SNAPSHOT, ...data });
  };

  const takeFullSnapshot = (isCheckout?: true) => {
    wrappedEmitWithTime(
      {
        type: EventType.META,
        href: location.href,
        width: queryWindowWidth(),
        height: queryWindowHeight()
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
    handlers.push(observe(incEmitWithTime));
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
  wrappedEmitWithTime({ type: EventType.CUSTOM, tag, payload });
}

export * from './types';
