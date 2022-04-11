import { FunctionKeys } from 'utility-types';
import { SOURCE } from '../constant';
import { stringify } from '../utils/stringify';

const keys = ['debug', 'error', 'info', 'log', 'warn'] as const;

export type PLogKey = typeof keys[number];

export type PLogHandler = {
  [k in PLogKey]: (...args: unknown[]) => any;
};

export type ConsoleParams = {
  source: SOURCE.CONSOLE;
  level: PLogKey;
  args: string[];
};

export type ConsoleCallback = (params: ConsoleParams) => void;

export function subConsole(cb: ConsoleCallback) {
  console['@raw'] = Object.assign({}, console);

  const proxy: Partial<PLogHandler> = keys.reduce((proxy, level) => {
    const handler = (...args: unknown[]) => {
      console['@raw']?.[level]?.apply(console, args);

      cb({ source: SOURCE.CONSOLE, level, args: args.map(stringify) });
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
