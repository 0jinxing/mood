import { mirror } from '@mood/snapshot';
import { InputEmitArg } from '@mood/record';
import { ReceiveHandler } from '../types';

export const receiveToInput: ReceiveHandler<InputEmitArg> = event => {
  const $target = mirror.getNode<HTMLInputElement>(event.id);

  if (!$target) return;

  if (typeof event.value === 'boolean') {
    $target.checked = event.value;
  } else {
    $target.value = event.value;
  }
};
