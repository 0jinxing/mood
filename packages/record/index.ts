import { snapshot } from '@mood/snapshot';
import { subscribe } from './subscribe';
import { on, queryViewport } from './utils';
import { RecordEvent, RecordEventWithTime, EmitHandler } from './types';
import { ET } from './constant';

export type RecordOptions = {
  emit: (e: RecordEventWithTime, checkout?: true) => void;
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

    if (event.type === ET.FULL_SNAPSHOT) {
      lastFullSnapshotEvent = event;
      incrementalSnapshotCount = 0;
    }

    if (event.type === ET.INCREMENTAL_SNAPSHOT) {
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

  wrappedEmitWithTime = (event: RecordEvent, checkout?: true) => {
    wrappedEmit(withTimestamp(event), checkout);
  };

  const incEmitWithTime: EmitHandler = data => {
    wrappedEmitWithTime({ type: ET.INCREMENTAL_SNAPSHOT, ...data });
  };

  const takeFullSnapshot = (checkout?: true) => {
    wrappedEmitWithTime(
      {
        type: ET.META,
        href: location.href,
        ...queryViewport()
      },
      checkout
    );
    const adds = snapshot(document);

    if (!adds) {
      console.warn('Failed to snapshot the document');
      throw new Error('Failed to snapshot the document');
    }

    const top = document.documentElement.scrollTop || 0;
    const left = document.documentElement.scrollLeft || 0;

    wrappedEmitWithTime({ type: ET.FULL_SNAPSHOT, adds, offset: [top, left] });
  };

  const unsubscribes: Function[] = [];
  unsubscribes.push(
    on('DOMContentLoaded', () => {
      wrappedEmitWithTime({ type: ET.DOM_CONTENT_LOADED });
    })
  );

  const initial = () => {
    takeFullSnapshot();
    unsubscribes.push(subscribe(incEmitWithTime));
  };

  if (
    document.readyState === 'interactive' ||
    document.readyState === 'complete'
  ) {
    initial();
  } else {
    unsubscribes.push(
      on(
        'load',
        () => {
          wrappedEmitWithTime({ type: ET.LOADED });
          initial();
        },
        window
      )
    );
  }

  return () => {
    unsubscribes.forEach(h => h());
  };
}

export function addCustomEvent<T>(tag: string, payload: T) {
  if (!wrappedEmitWithTime) {
    throw new Error('please add custom event after start recording');
  }
  wrappedEmitWithTime({ type: ET.CUSTOM, tag, payload });
}

export * from './types';
export * from './constant';
export * from './subscribe';
