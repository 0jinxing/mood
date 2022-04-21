import { snapshot } from '@mood/snapshot';
import { subscribe } from './subscribe';
import { queryViewport } from './utils';
import { RecordEvent, RecordEventWithTime, EmitHandler, EventType } from './types';
import { each, on } from '@mood/utils';

export type RecordOptions = {
  emit: (e: RecordEventWithTime, checkout?: true) => void;
  subscribes?: (emit: EmitHandler) => () => void;
  checkoutEveryNth?: number;
  checkoutEveryNms?: number;
};

function withTimestamp(e: RecordEvent): RecordEventWithTime {
  return { ...e, timestamp: Date.now() };
}

let wrappedEmit: (e: RecordEventWithTime, checkout?: true) => void;
let wrappedEmitWithTime: (e: RecordEvent, checkout?: true) => void;

export function record(options: RecordOptions) {
  const { emit, checkoutEveryNms, checkoutEveryNth } = options;

  let lastFullSnapshotEvent: RecordEventWithTime;
  let incrementalSnapshotCount = 0;

  wrappedEmit = (event: RecordEventWithTime, checkout?: true) => {
    emit(event, checkout);

    if (event.type === EventType.FULL_SNAPSHOT) {
      lastFullSnapshotEvent = event;
      incrementalSnapshotCount = 0;
    }

    if (event.type === EventType.INCREMENTAL_SNAPSHOT) {
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
    wrappedEmitWithTime({ type: EventType.INCREMENTAL_SNAPSHOT, ...data });
  };

  const takeFullSnapshot = (checkout?: true) => {
    wrappedEmitWithTime(
      {
        type: EventType.META,
        href: location.href,
        ...queryViewport()
      },
      checkout
    );
    const adds = snapshot(document);

    if (!adds) {
      throw new Error('Failed to snapshot the document');
    }

    const top = document.documentElement.scrollTop || 0;
    const left = document.documentElement.scrollLeft || 0;

    wrappedEmitWithTime({
      type: EventType.FULL_SNAPSHOT,
      adds,
      offset: [top, left]
    });
  };

  const unsubscribes: Function[] = [];
  unsubscribes.push(
    on('DOMContentLoaded', () => {
      wrappedEmitWithTime({ type: EventType.DOM_CONTENT_LOADED });
    })
  );

  const initial = () => {
    takeFullSnapshot();
    unsubscribes.push(subscribe(incEmitWithTime));
  };

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initial();
  } else {
    unsubscribes.push(
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

  return () => each(unsubscribes, u => u() && false);
}

export function addCustomEvent<T>(tag: string, payload: T) {
  if (!wrappedEmitWithTime) {
    throw new Error('please add custom event after start recording');
  }
  wrappedEmitWithTime({ type: EventType.CUSTOM, tag, payload });
}

export * from './types';
export * from './subscribe';
export * from './utils';
