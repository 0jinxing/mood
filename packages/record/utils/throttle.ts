export type Throttled = {
  (...args: any): void;
  timestamp: number;
};

export function throttle<T>(func: (arg: T) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let previous = 0;
  let lastArgs: any[];

  const later = () => {
    previous = Date.now();
    timeout = undefined;
    func.apply(null, lastArgs);
  };

  const throttled: Throttled = (...args: any[]) => {
    throttled.timestamp = Date.now();
    lastArgs = args;
    previous = previous || throttled.timestamp;

    const remaining = wait - (throttled.timestamp - previous);
    if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
  };
  throttled.timestamp = 0;

  return throttled;
}
