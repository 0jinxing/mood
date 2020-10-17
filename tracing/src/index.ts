import record from '@mood/record';
import getStorage, { StorageConfig } from './storage';
import getReport, { ReportCofig } from './report';

export type TracingConfig = {
  report: ReportCofig;
  storage?: StorageConfig;
};

async function tracing(config: TracingConfig) {
  const storage = getStorage(config.storage);
  const report = getReport(config.report);

  record({
    emit: async event => {
      if (typeof event === 'string') return;
      const res = storage.add([event]);
    }
  });
}

export default tracing;
