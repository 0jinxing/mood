import { hookSetter, plain } from '../utils';

export type LogLevel = 'log' | 'warn' | 'error' | 'debug';

export type LogCbParam = {
  type: LogLevel;
  args: unknown;
};

export const LOG_LEVELS: Array<LogLevel> = ['log', 'warn', 'error', 'debug'];

export type LogCb = (param: LogCbParam) => void;

const origin = LOG_LEVELS.reduce((origin, key) => {
  origin[key] = console[key];
  return origin;
}, {} as typeof console);

function logObserve(cb: LogCb) {
  const handlers = LOG_LEVELS.map(key => {
    return hookSetter(console, key, {
      get() {
        return (...args: unknown[]) => {
          setTimeout(() => cb({ type: key, args: plain(args) }));
          
          return origin[key].apply(console, args);
        };
      }
    });
  });

  return () => handlers.forEach(h => h());
}

export default logObserve;
