import { SourceType } from '../constant';
import { stringify } from '../utils/stringify';

const keys = ['debug', 'error', 'info', 'log', 'warn'] as const;

export type PLogKey = typeof keys[number];

export type PLogHandler = {
  [k in PLogKey]: (...args: unknown[]) => any;
};

export type SubscribeToConsoleArg = {
  source: SourceType.CONSOLE;
  level: PLogKey;
  args: string[];
};

export type SubscribeToConsoleEmit = (arg: SubscribeToConsoleArg) => void;

export function subscribeToConsole(cb: SubscribeToConsoleEmit) {
  console['@raw'] = Object.assign({}, console);

  const proxy: Partial<PLogHandler> = keys.reduce((proxy, level) => {
    const handler = (...args: unknown[]) => {
      console['@raw']?.[level]?.apply(console, args);

      cb({ source: SourceType.CONSOLE, level, args: args.map(stringify) });
    };

    return { ...proxy, [level]: handler };
  }, {});

  Object.assign(console, proxy);

  return () => {
    Object.assign(console, console['@raw']);
    console['@raw'] = undefined;
  };
}

declare global {
  interface Console {
    '@raw'?: Omit<Console, '@raw'>;
  }
}
