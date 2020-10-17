import { TEventWithTime } from '@mood/record';

export type TEventWithTimeAndSession = TEventWithTime & {
  session: string;
  _pk?: number;
};
