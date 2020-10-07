import { IncrementalSource } from '../constant';
import { plain } from '../utils';

export type LogLevel = 'log' | 'warn' | 'error' | 'debug';

export type LogCbParam = {
  source: IncrementalSource.LOG;
  level: LogLevel;
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
    console[key] = function (...args: unknown[]) {
      
      setTimeout(() =>
        cb({ source: IncrementalSource.LOG, level: key, args: plain(args) })
      );
      return origin[key].apply(console, args);
    };

    return () => {
      LOG_LEVELS.forEach(key => (console[key] = origin[key]));
    };
  });

  return () => {
    handlers.forEach(h => h());
  };
}

export default logObserve;
