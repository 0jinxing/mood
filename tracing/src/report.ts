import { deflate } from 'pako';
import { TEventWithTime } from '@mood/record';
import { TEventWithTimeAndSession } from './types';
import { currentSesstionId } from './utils/sessionId';

export type ReportCofig = {
  url: string;
  uid: string;
};

export function getReport(config: ReportCofig) {
  return function (events: TEventWithTimeAndSession[]) {
    const pickEvents: TEventWithTime[] = events
      .filter(ev => ev.session === currentSesstionId())
      .map(ev => ({ ...ev, session: undefined }));

    const data = {
      uid: config.uid,
      session: currentSesstionId(),
      data: deflate(JSON.stringify(pickEvents), { to: 'string' })
    };

    return fetch(config.url, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };
}

export default getReport;
