export type ActionWithDelay = {
  exec: () => void;
  delay: number;
};

export class Scheduler {
  public offset: number = 0;

  private raf: number | true = 0;

  constructor(
    public speed: number = 1,
    private queue: ActionWithDelay[] = []
  ) {}

  public push(...list: ActionWithDelay[]) {
    // TODO 插入性能优化
    this.queue.push(...list);
    this.queue.sort((a1, a2) => a1.delay - a2.delay);

    if (this.raf === true) {
      this.start();
    }
  }

  public start() {
    const { queue, speed } = this;

    this.offset = 0;
    let prevTimestamp = performance.now();

    const frameRequest = (time: number) => {
      this.offset += (time - prevTimestamp) * speed;
      prevTimestamp = time;

      while (this.offset >= queue[0]?.delay) queue.shift()?.exec();

      if (queue.length > 0) {
        this.raf = requestAnimationFrame(frameRequest);
      } else {
        this.raf = true;
      }
    };
    this.raf = requestAnimationFrame(frameRequest);
  }

  public clear() {
    if (typeof this.raf === 'number') {
      cancelAnimationFrame(this.raf);
    }
    this.raf = 0;
    this.queue = [];
  }
}

export function createScheduler() {
  return new Scheduler();
}
