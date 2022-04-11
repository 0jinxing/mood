import { ConsoleParams } from '@mood/record';
import { RecHandler } from '../types';

export const recConsole: RecHandler<ConsoleParams> = event => {
  const a = console[event.level];
  a.apply(console, event.args);
};
