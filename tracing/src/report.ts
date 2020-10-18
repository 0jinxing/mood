import 'whatwg-fetch';
import { deflate } from 'pako';
import { TEventWithTime } from '@mood/record';
import { currentSesstionId } from './utils/sessionId';

export type ReportOptions = {
  url: string;
  uid: string;
};

export function getReport(options: ReportOptions) {
  return function (events: Array<TEventWithTime>) {
    const data = {
      uid: options.uid,
      session: currentSesstionId(),
      data: deflate(JSON.stringify(events), { to: 'string' })
    };

    fetch(options.url, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => { /* ignore */ });
  };
}

export default getReport;
