import { Mirror, SNWithId, snapshot } from '@mood/snapshot';
import { ObserveEmitArg, observe } from './observe';
import { ET } from './types';
import { queryViewport } from './utils';
import { each, on } from '@mood/utils';

export type DomContentLoadedEvent = { type: ET.DOM_CONTENT_LOADED };

export type LoadedEvent = { type: ET.LOADED };

export type SnapshotEvent = {
  type: ET.SNAPSHOT;
  width: number;
  height: number;
  adds: SNWithId[];
  offset: [top: number, left: number];
};

export type DeltaEvent = { type: ET.DELTA } & ObserveEmitArg;

export type MetaEvent = {
  type: ET.META;
  href: string;
  width: number;
  height: number;
};

export type RecordEvent =
  | DomContentLoadedEvent
  | LoadedEvent
  | SnapshotEvent
  | DeltaEvent
  | MetaEvent;

export type RecordEventWithTime = RecordEvent & { timestamp: number };

export type RecordOptions = {
  mirror: Mirror;
  emit: (e: RecordEventWithTime, checkout?: true) => void;
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
  const { emit, checkoutEveryNms, checkoutEveryNth, doc = document } = options;

  let lastSnapshotEvent: RecordEventWithTime;
  let deltaCount = 0;

  wrappedEmit = (event: RecordEventWithTime, checkout?: true) => {
    emit(event, checkout);

    if (event.type === ET.SNAPSHOT) {
      lastSnapshotEvent = event;
      deltaCount = 0;
    }

    if (event.type === ET.DELTA) {
      deltaCount += 1;
      const exceedCount = checkoutEveryNth && deltaCount >= checkoutEveryNth;
      const exceedTime =
        checkoutEveryNms && event.timestamp - lastSnapshotEvent.timestamp > checkoutEveryNms;

      if (exceedCount || exceedTime) {
        takeSnapshot(true);
      }
    }
  };

  wrappedEmitWithTime = (event: RecordEvent, checkout?: true) => {
    wrappedEmit(withTimestamp(event), checkout);
  };

  const incEmitWithTime = (data: ObserveEmitArg) => {
    wrappedEmitWithTime({ type: ET.DELTA, ...data });
  };

  const takeSnapshot = (checkout?: true) => {
    wrappedEmitWithTime({ type: ET.META, href: location.href, ...queryViewport(doc) }, checkout);
    const adds = snapshot(doc, options.mirror);

    if (!adds) {
      throw new Error('Failed to snapshot the document');
    }

    const top = doc.documentElement.scrollTop || 0;
    const left = doc.documentElement.scrollLeft || 0;

    wrappedEmitWithTime({
      type: ET.SNAPSHOT,
      ...queryViewport(doc),
      adds,
      offset: [top, left]
    });
  };

  const unsubscribes: Function[] = [];

  unsubscribes.push(
    on(doc, 'DOMContentLoaded', () => {
      wrappedEmitWithTime({ type: ET.DOM_CONTENT_LOADED });
    })
  );

  const initial = () => {
    takeSnapshot();
    unsubscribes.push(observe(incEmitWithTime, { doc, mirror: options.mirror }));
  };

  if (doc.readyState === 'interactive' || doc.readyState === 'complete') {
    initial();
  } else {
    unsubscribes.push(
      on(doc, 'DOMContentLoaded', () => {
        wrappedEmitWithTime({ type: ET.LOADED });
        initial();
      })
    );
  }

  return () => each(unsubscribes, u => u());
}

export * from './types';
export * from './observe';
export * from './utils';

export * from '@mood/snapshot';
