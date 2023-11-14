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

type PayloadEvent = SendChunkEvent | AckChunkEvent | RequestControlEvent;
type WithoutPayloadEvent = Exclude<MessagerEventTypes, PayloadEvent['event']>;

export type MessagerEvent = PayloadEvent | { event: WithoutPayloadEvent };

export type MessagerEventHandler<E extends MessagerEventTypes = any> = (
  payload: Extract<MessagerEvent, { event: E }> extends { payload: infer P } ? P : never
) => void;

export interface Messager {
  send(data: MessagerEvent): Promise<void>;

  on<E extends MessagerEventTypes>(event: E, handler: MessagerEventHandler<E>): () => void;
  off<E extends MessagerEventTypes>(event: E, handler?: MessagerEventHandler<E>): void;

  dispose(): void;
}
