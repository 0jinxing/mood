import { RecordEventWithTime } from '@mood/record';

export enum TransporterEventTypes {
  SOURCE_READY = 'SOURCE_READY',
  MIRROR_READY = 'MIRROR_READY',
  START = 'START',
  STOP = 'STOP',

  SEND_CHUNK = 'SEND_CHUNK',
  ACK_CHUNK = 'ACK_CHUNK',
  REQUEST_CONTROL = 'REQUEST_CONTROL'
}

export type Chunk<D> = {
  id: number;
  timestamp: number;
  data: D;
};

export type SendChunkEvent = {
  event: TransporterEventTypes.SEND_CHUNK;
  chunk: Chunk<RecordEventWithTime>;
};

export type AckChunkEvent = {
  event: TransporterEventTypes.ACK_CHUNK;
  id: number;
};

type PayloadEvent = SendChunkEvent | AckChunkEvent;

export type TransporterEvent =
  | PayloadEvent
  | { event: Exclude<TransporterEventTypes, PayloadEvent['event']> };

export type TransporterEventHandler<E extends TransporterEventTypes = any> = (
  payload: Extract<TransporterEvent, { event: E }>
) => void;

export interface Transporter {
  send(data: TransporterEvent): Promise<void>;

  on<E extends TransporterEventTypes>(event: E, handler: TransporterEventHandler<E>): () => void;
  off<E extends TransporterEventTypes>(event: E, handler?: TransporterEventHandler<E>): void;

  dispose(): void;
}
