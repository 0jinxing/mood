import { SubscribeToConsoleArg } from '@mood/record';
import { ReceiveHandler } from '../types';

export const receiveToConsole: ReceiveHandler<SubscribeToConsoleArg> = event => {
  const a = console[event.level];
  a.apply(console, event.args);
};
