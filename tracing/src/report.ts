import { deflate } from 'pako';
import { TEventWithTime } from '@mood/record';
import { TEventWithTimeAndSession } from './types';
import { currentSesstionId } from './utils/sessionId';

export type ReportOptions = {
  url: string;
  uid: string;
};

export function getReport(options: ReportOptions) {
  return function (events: Array<TEventWithTime | TEventWithTimeAndSession>) {
    const pickEvents: TEventWithTime[] = events
      .filter(ev => !('session' in ev) || ev.session === currentSesstionId())
      .map(ev => ({ ...ev, session: undefined }));

    const data = {
      uid: options.uid,
      session: currentSesstionId(),
      data: deflate(JSON.stringify(pickEvents), { to: 'string' })
    };

    return fetch(options.url, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };
}

export default getReport;
