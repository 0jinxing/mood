import record, { RecordOptions, TEventWithTime } from '@mood/record';
import getStorage, { StorageOptions } from './storage';
import getReport, { ReportOptions } from './report';
import { EventType, IncrementalSource } from '@mood/record/constant';

export type TracingOptions = {
  report: ReportOptions;
  record: Omit<RecordOptions, 'emit'>;
  storage: StorageOptions;
};

async function tracing(options: TracingOptions) {
  const storage = getStorage(options.storage);
  const report = getReport(options.report);
  let lastFullSnapshotEv: TEventWithTime | null = null;

  async function reportLast() {
    const db = await storage.db$;
    const tx = db.transaction('events');
    const range = IDBKeyRange.lowerBound(lastFullSnapshotEv?.timestamp);
    const events = await tx.db.getAllFromIndex('events', 'timestamp', range);

    await report([...events]);
    await Promise.all(events.map(ev => tx.db.delete('events', ev._pk!)));
    console.log(events.length);
    await tx.done;
  }

  record({
    emit: async ev => {
      if (typeof ev === 'string') return;
      if (ev.type === EventType.FULL_SNAPSHOT || ev.type === EventType.CUSTOM) {
        await report([ev]);
        lastFullSnapshotEv = ev;
        return;
      } else if (ev.type === EventType.INCREMENTAL_SNAPSHOT) {
        const globalErr = ev.source === IncrementalSource.GLOBAL_ERROR;
        
        const logErr =
          ev.source === IncrementalSource.LOG && ev.level === 'error';

        if (globalErr || logErr) {
          await Promise.all([reportLast(), report([ev])]);
          return;
        }
      }
      storage.add([ev]);
    },
    ...options.record
  });
}

export default tracing;
