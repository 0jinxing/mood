import { hookSetter, plain } from '../utils';

export type LogLevel = 'log' | 'warn' | 'error' | 'debug';

export type LogCallbackParams = {
  type: LogLevel;
  args: unknown;
};

export const LOG_LEVEL: Array<LogLevel> = ['log', 'warn', 'error', 'debug'];

export type LogCallback = (params: LogCallbackParams) => void;

const origin = LOG_LEVEL.reduce((origin, key) => {
  origin[key] = console[key];
  return origin;
}, {} as typeof console);

function initLogObserver(cb: LogCallback) {
  const handlers = LOG_LEVEL.map(key => {
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

export default initLogObserver;
