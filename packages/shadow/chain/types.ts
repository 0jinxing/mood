export enum ChainEvents {
  SOURCE_READY,
  MIRROR_READY,
  START,
  STOP,
  SEND_CHUNK,
  ACK_CHUNK,
  REQUEST_CONTROLLER
}

export type Chunk<D> = {
  id: number;
  t: number;
  data: D;
};

export type SendChunkEvent = {};

export interface Chain {
  send(data: unknown): Promise<void>;

  on(event: string, handler: (...args: unknown[]) => void): () => unknown;
  off(event: string, handler?: (...args: unknown[]) => void): void;
}
