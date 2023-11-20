import { Chunk } from './transporter/types';

export const DEFAULT_TIMEOUT = 500;

export class CursorBuffer<D> {
  cursor = 0;
  model: Record<string, Chunk<D>> = {};

  add(data: D) {
    this.cursor++;

    this.model[this.cursor] = {
      id: this.cursor,
      timestamp: performance.now(),
      data
    };
    return this.cursor;
  }

  delete(id: number) {
    delete this.model[id];
  }

  reset() {
    this.model = {};
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

  private retry() {
    requestAnimationFrame(() => {
      for (const key in this.model) {
        const record = this.model[key];
        const now = performance.now();

        if (now - record.timestamp > (this.options.timeout || DEFAULT_TIMEOUT)) {
          this.options.onTimeout?.(record);
          record.timestamp = now;
        }
      }
      this.retry();
    });
  }
}

export type ClientBufferOptions<D> = {
  onEmit: (data: Chunk<D>) => void;
};

export class ClientBuffer<D> extends CursorBuffer<D> {
  constructor(private options: ClientBufferOptions<D>) {
    super();
  }

  add(data: D): number {
    super.add(data);
    this.apply(this.model[this.cursor]);
    return this.cursor;
  }

  /**
   * 考虑 chunk 乱序 或者 chunk 丢失的情况
   * TODOS:
   * 是否需要保证 chunk 的顺序？
   * 如果需要，怎么保证 chunk 的顺序？（无效丢失，让 对方 重发）
   */
  apply(chunk: Chunk<D>) {
    if (chunk.id < this.cursor) return;
    this.model[chunk.id] = chunk;
    this.emit();
  }

  private emit() {
    const records = Object.values(this.model);
    let index = 0;
    while (index < records.length && this.cursor === records[index].id) {
      this.options.onEmit(records[index]);
      this.delete(records[index].id);

      this.cursor++;
      index++;
    }
  }
}
