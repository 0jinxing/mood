import { ActionWithDelay } from './types';

export default class Timer {
  public timeOffset: number = 0;
  private raf: number;

  constructor(
    private speed: number = 1,
    private actions: ActionWithDelay[] = []
  ) {}

  public setSpeed(speed = 1) {
    this.speed = speed;
  }

  public addAction(action: ActionWithDelay) {
    const index = this.findActionIndex(action);
    this.actions.splice(index, 0, action);
  }

  public addActions(actions: ActionWithDelay[]) {
    this.actions.push(...actions);
  }

  public start() {
    const { actions, speed } = this;

    actions.sort((a1, a2) => a1.delay - a2.delay);
    this.timeOffset = 0;
    let lastTimestamp = performance.now();

    const check = (time: number) => {
      this.timeOffset += (time - lastTimestamp) * speed;
      lastTimestamp = time;
      while (actions.length) {
        const action = actions[0];
        if (this.timeOffset >= action.delay) {
          actions.shift();
          action.doAction();
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

  private findActionIndex(action: ActionWithDelay): number {
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
