export type ActionWithDelay = {
  exec: () => void;
  delay: number;
};

export class Timer {
  public offset: number = 0;

  private raf: number;

  constructor(private speed: number = 1, private actions: ActionWithDelay[] = []) {}

  public setSpeed(speed = 1) {
    this.speed = speed;
  }

  public insert(action: ActionWithDelay) {
    const index = this.findIndex(action);
    this.actions.splice(index, 0, action);
  }

  public concat(actions: ActionWithDelay[]) {
    this.actions.push(...actions);
  }

  public start() {
    const { actions, speed } = this;

    actions.sort((a1, a2) => a1.delay - a2.delay);
    this.offset = 0;
    let lastTimestamp = performance.now();

    const check = (time: number) => {
      this.offset += (time - lastTimestamp) * speed;
      lastTimestamp = time;
      while (actions.length) {
        const action = actions[0];
        if (this.offset >= action.delay) {
          actions.shift();
          action.exec();
        } else {
          break;
        }
      }
      if (actions.length > 0) {
        this.raf = requestAnimationFrame(check);
      }
    };
    this.raf = requestAnimationFrame(check);
  }

  public clear() {
    this.raf && cancelAnimationFrame(this.raf);
    this.actions = [];
  }

  private findIndex(action: ActionWithDelay): number {
    let start = 0;
    let end = this.actions.length - 1;
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (this.actions[mid].delay < action.delay) {
        start = mid + 1;
      } else if (this.actions[mid].delay > action.delay) {
        end = mid - 1;
      } else {
        return mid;
      }
    }
    return start;
  }
}

export function createTimer() {
  return new Timer();
}
