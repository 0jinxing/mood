import { RecordEventWithTime } from '@mood/record';

export enum MessagerEventTypes {
  SOURCE_READY,
  MIRROR_READY,
  START,
  STOP,
  SEND_CHUNK,
  ACK_CHUNK,
  REQUEST_CONTROL
}

export type Chunk<D> = {
  id: number;
  timestamp: number;
  data: D;
};

export type SendChunkEvent = {
  event: MessagerEventTypes.SEND_CHUNK;
  payload: Chunk<RecordEventWithTime>;
};

export type AckChunkEvent = {
  event: MessagerEventTypes.ACK_CHUNK;
  id: number;
};

export type RequestControlEvent = {
  event: MessagerEventTypes.REQUEST_CONTROL;
  uid: string;
};

export type MessagerEvent = SendChunkEvent | AckChunkEvent | RequestControlEvent;

export interface Messager {
  send(data: unknown): Promise<void>;

  on(event: string, handler: (...args: unknown[]) => void): () => unknown;
  off(event: string, handler?: (...args: unknown[]) => void): void;
}
