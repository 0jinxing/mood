import { Chunk } from './messager/types';

export const DEFAULT_TIMEOUT = 500;

export class CursorBuffer<D> {
  cursor = 0;
  buffer: Record<string, Chunk<D>> = {};

  add(data: D) {
    this.cursor++;
    this.buffer[this.cursor] = {
      id: this.cursor,
      timestamp: performance.now(),
      data
    };
    return this.cursor;
  }

  delete(id: number) {
    delete this.buffer[id];
  }

  reset() {
    this.buffer = {};
    this.cursor = 0;
  }
}

export type EmbedBufferOptions<D> = {
  timeout?: number;
  onTimeout?: (data: Chunk<D>) => void;
};

export class EmbedBuffer<D> extends CursorBuffer<D> {
  constructor(private options: EmbedBufferOptions<D>) {
    super();
  }

  private timeoutAndRetry() {
    requestAnimationFrame(() => {
      for (const key in this.buffer) {
        const record = this.buffer[key];
        const now = performance.now();
        if (now - record.timestamp > (this.options.timeout || DEFAULT_TIMEOUT)) {
          this.options.onTimeout?.(record);
          record.timestamp = now;
        }
      }
      this.timeoutAndRetry();
    });
  }
}

export type ClientBufferOptions = {};
