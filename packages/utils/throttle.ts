export type Throttled = {
  (...args: any): void;
  timestamp: number;
};

export function throttle<T>(func: (arg: T) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let prev = 0;
  let curArgs: any[];

  const callback = () => {
    prev = Date.now();
    timeout = undefined;

    func.apply(null, curArgs);
  };

  const throttled: Throttled = (...args: any[]) => {
    throttled.timestamp = Date.now();
    curArgs = args;
    prev = prev || throttled.timestamp;

    if (timeout) return;

    const ms = wait - throttled.timestamp + prev;
    timeout = setTimeout(callback, ms);
  };
  throttled.timestamp = 0;

  return throttled;
}
