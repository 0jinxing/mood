import { RecordEventWithTime } from '@mood/record';

export enum TransporterEventTypes {
  REQUEST_CONNECTION = 'REQUEST_CONNECTION',

  CONNECTION_ACCEPT = 'CONNECTION_ACCEPT',
  CONNECTION_REJECTED = 'CONNECTION_REJECTED',

  SEND = 'SEND',
  ACK = 'ACK'
}

export type Chunk<D> = {
  id: number;
  timestamp: number;
  data: D;
};

export type RequestConnectionEvent = {
  event: TransporterEventTypes.REQUEST_CONNECTION;
  id: number;
};

export type ConnectionAcceptEvent = {
  event: TransporterEventTypes.CONNECTION_ACCEPT;
  id: number;
};

export type SendEvent = {
  event: TransporterEventTypes.SEND;
  payload: Chunk<RecordEventWithTime> | Array<Chunk<RecordEventWithTime>>;
};

export type AckEvent = {
  event: TransporterEventTypes.ACK;
  ids: Array<number>;
};

type PayloadEvent = RequestConnectionEvent | ConnectionAcceptEvent | SendEvent | AckEvent;

export type TransporterEvent =
  | PayloadEvent
  | { event: Exclude<TransporterEventTypes, PayloadEvent['event']> };

export type TransporterEventHandler<E extends TransporterEventTypes = any> = (
  payload: Extract<TransporterEvent, { event: E }>
) => void;

export interface Transporter {
  send(data: TransporterEvent): Promise<void>;

  on<E extends TransporterEventTypes>(event: E, handler: TransporterEventHandler<E>): () => unknown;
  off<E extends TransporterEventTypes>(event: E, handler?: TransporterEventHandler<E>): unknown;

  dispose(): unknown;
}
