import record, { RecordOptions, TEventWithTime } from '@mood/record';
import { EventType, IncrementalSource } from '@mood/record/constant';
import getReport, { ReportOptions } from './report';

export type TracingOptions = {
  report: ReportOptions;
  record: Omit<RecordOptions, 'emit'>;
};

async function tracing(options: TracingOptions) {
  const report = getReport(options.report);

  function isSelfEvent(ev: TEventWithTime) {
    if (ev.type === EventType.INCREMENTAL_SNAPSHOT) {
      if (ev.source === IncrementalSource.REQUEST_FETCH) {
        return (
          typeof ev.input === 'string' && ev.input.includes(options.report.url)
        );
      } else if (ev.source === IncrementalSource.REQUEST_XHR) {
        return ev.url.includes(options.report.url);
      }
    }
    return false;
  }

  let lastFullSnapshotEvent: TEventWithTime | null = null;
  let events: TEventWithTime[] = [];
  record({
    emit: async ev => {
      if (isSelfEvent(ev)) return;
      switch (ev.type) {
        case EventType.CUSTOM: {
          report([ev]);
          break;
        }

        case EventType.FULL_SNAPSHOT: {
          if (
            !lastFullSnapshotEvent ||
            Date.now() - lastFullSnapshotEvent.timestamp > 1000 * 60 * 5
          ) {
            report([ev]);
            lastFullSnapshotEvent = ev;
            events = [];
          }
          break;
        }

        case EventType.INCREMENTAL_SNAPSHOT: {
          const reportSource = [
            IncrementalSource.GLOBAL_ERROR,
            IncrementalSource.LOG,
            IncrementalSource.REQUEST_FETCH,
            IncrementalSource.REQUEST_XHR
          ];
          if (reportSource.includes(ev.source)) {
            report([ev]);
          } else {
            events.push(ev);
          }

          const consoleErr =
            ev.source === IncrementalSource.LOG && ev.level === 'error';

          const globalErr = ev.source === IncrementalSource.GLOBAL_ERROR;

          if (consoleErr || globalErr) {
            report(events);
            events = [];
          }
          break;
        }

        default: {
          report([ev]);
        }
      }
    },
    ...options.record
  });
}

export default tracing;
