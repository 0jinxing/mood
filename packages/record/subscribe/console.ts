import { SourceType } from '../types';
import { stringify } from '../utils';
import { hookMethod } from '@mood/utils';

const keys = ['debug', 'error', 'info', 'log', 'warn'] as const;

export type LogLevel = typeof keys[number];

export type SubscribeToConsoleArg = {
  source: SourceType.CONSOLE;
  level: LogLevel;
  args: string[];
};

export type SubscribeToConsoleEmit = (arg: SubscribeToConsoleArg) => void;

export function subscribeToConsole(cb: SubscribeToConsoleEmit) {
  const unsubscribes = keys.map(level => {
    return hookMethod(console, level, (...args: unknown[]) => {
      cb({ source: SourceType.CONSOLE, level, args: args.map(stringify) });
    });
  });

  return () => unsubscribes.map(u => u());
}
