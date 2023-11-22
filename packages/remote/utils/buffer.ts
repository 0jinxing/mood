import { Chunk } from './transporter/types';

export const DEFAULT_TIMEOUT = 500;

export abstract class ChunkBuffer<D> {
  protected rafId: ReturnType<typeof requestAnimationFrame> = 0;

  cursor = 0;
  model: Record<string, Chunk<D>> = {};

  abstract add(data: D | Chunk<D>): number;

  delete(id: number) {
    delete this.model[id];
  }

  reset() {
    cancelAnimationFrame(this.rafId);
    Object.assign(this, { model: {}, cursor: 0, rafId: 0 });
  }
}

export type EmbedBufferOptions<D> = {
  timeout?: number;
  onTimeout?: (data: Chunk<D>) => void;
};

export class EmbedBuffer<D> extends ChunkBuffer<D> {
  constructor(private options: EmbedBufferOptions<D>) {
    super();
  }

  add(data: D): number {
    this.model[this.cursor] = { id: this.cursor, timestamp: performance.now(), data };
    this.cursor++;
    this.rafTimeout();

    return this.cursor;
  }

  private rafTimeout() {
    cancelAnimationFrame(this.rafId);

    if (Object.values(this.model).length === 0) return;

    requestAnimationFrame(() => {
      for (const key in this.model) {
        const record = this.model[key];
        const now = performance.now();

        if (now - record.timestamp > (this.options.timeout || DEFAULT_TIMEOUT)) {
          this.options.onTimeout?.(record);
          record.timestamp = now;
        }
      }
      this.rafTimeout();
    });
  }
}

export type MirrorBufferOptions<D> = {
  onEmit: (data: Chunk<D>) => void;
};

export class MirrorBuffer<D> extends ChunkBuffer<D> {
  constructor(private options: MirrorBufferOptions<D>) {
    super();
  }

  add(chunk: Chunk<D>) {
    if (chunk.id > this.cursor) {
      this.model[chunk.id] = chunk;
    }

    this.rafEmit();
    return this.cursor;
  }

  private rafEmit() {
    cancelAnimationFrame(this.rafId);
    if (this.model[this.cursor]) {
      this.options.onEmit(this.model[this.cursor]);
      this.delete(this.cursor);
      this.cursor++;
      this.rafEmit();
    }
  }
}
