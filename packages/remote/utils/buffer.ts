import { Chunk } from './transporter/types';

export const DEFAULT_TIMEOUT = 500;

export abstract class ChunkBuffer<D> {
  protected rafId: ReturnType<typeof requestAnimationFrame> = 0;

  cursor = 0;
  model: Record<string, Chunk<D>> = {};

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
  onTimeout?: (data: Chunk<D>[]) => void;
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

    this.rafId = requestAnimationFrame(() => {
      const sortKeys = Object.keys(this.model).sort((a, b) => Number(a) - Number(b));
      const now = performance.now();

      const sort: Chunk<D>[] = [];
      const timeout = this.options.timeout || DEFAULT_TIMEOUT;

      sortKeys.forEach(key => {
        const item = this.model[key];

        if (now - item.timestamp >= timeout) {
          sort.push(item);
          item.timestamp = now;
        }
      });

      if (sortKeys.length > sort.length) {
        this.rafTimeout();
      }

      if (sort.length) {
        this.options.onTimeout?.(sort);
      }
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

  add(sort: Chunk<D>[]) {
    sort.forEach(item => {
      if (item.id >= this.cursor) {
        this.model[item.id] = item;
      }
    });

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
