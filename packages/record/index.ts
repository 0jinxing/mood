import { snapshot } from '@mood/snapshot';
import { subscribe } from './observers';
import { queryViewport } from './utils';
import { RecordEvent, RecordEventWithTime, EmitHandler, EventTypes } from './types';
import { each, on } from '@mood/utils';

export type RecordOptions = {
  emit: (e: RecordEventWithTime, checkout?: true) => void;
  customHandler?: (emit: EmitHandler) => () => void;
  checkoutEveryNth?: number;
  checkoutEveryNms?: number;
  doc?: Document;
};

function withTimestamp(e: RecordEvent): RecordEventWithTime {
  return { ...e, timestamp: Date.now() };
}

let wrappedEmit: (e: RecordEventWithTime, checkout?: true) => void;
let wrappedEmitWithTime: (e: RecordEvent, checkout?: true) => void;

export function record(options: RecordOptions) {
  const { emit, customHandler, checkoutEveryNms, checkoutEveryNth, doc = document } = options;

  let lastFullSnapshotEvent: RecordEventWithTime;
  let incrementalSnapshotCount = 0;

  wrappedEmit = (event: RecordEventWithTime, checkout?: true) => {
    emit(event, checkout);

    if (event.type === EventTypes.FULL_SNAPSHOT) {
      lastFullSnapshotEvent = event;
      incrementalSnapshotCount = 0;
    }

    if (event.type === EventTypes.INCREMENTAL_SNAPSHOT) {
      incrementalSnapshotCount += 1;
      const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime =
        checkoutEveryNms && event.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;

      if (exceedCount || exceedTime) {
        takeFullSnapshot(true);
      }
    }
  };

  wrappedEmitWithTime = (event: RecordEvent, checkout?: true) => {
    wrappedEmit(withTimestamp(event), checkout);
  };

  const incEmitWithTime: EmitHandler = data => {
    wrappedEmitWithTime({ type: EventTypes.INCREMENTAL_SNAPSHOT, ...data });
  };

  const takeFullSnapshot = (checkout?: true) => {
    wrappedEmitWithTime(
      {
        type: EventTypes.META,
        href: location.href,
        ...queryViewport()
      },
      checkout
    );
    const adds = snapshot(doc);

    if (!adds) {
      throw new Error('Failed to snapshot the document');
    }

    const top = doc.documentElement.scrollTop || 0;
    const left = doc.documentElement.scrollLeft || 0;

    wrappedEmitWithTime({
      type: EventTypes.FULL_SNAPSHOT,
      adds,
      offset: [top, left]
    });
  };

  const unsubscribes: Function[] = [];

  unsubscribes.push(
    on(doc, 'DOMContentLoaded', () => {
      wrappedEmitWithTime({ type: EventTypes.DOM_CONTENT_LOADED });
    })
  );

  const initial = () => {
    takeFullSnapshot();
    unsubscribes.push(subscribe(incEmitWithTime));
    customHandler && unsubscribes.push(customHandler(incEmitWithTime));
  };

  if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
    initial();
  } else {
    unsubscribes.push(
      on(window, 'load', () => {
        wrappedEmitWithTime({ type: EventTypes.LOADED });
        initial();
      })
    );
  }

  return () => each(unsubscribes, u => u());
}

export function addCustomEvent<T>(tag: string, payload: T) {
  if (!wrappedEmitWithTime) {
    throw new Error('please add custom event after start recording');
  }
  wrappedEmitWithTime({ type: EventTypes.CUSTOM, tag, payload });
}

export * from './types';
export * from './observers';
export * from './utils';
