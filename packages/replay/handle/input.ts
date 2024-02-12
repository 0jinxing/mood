import { InputEmitArg } from '@mood/record';
import { EmitHandler } from '../types';

export const handleInputEmit: EmitHandler<InputEmitArg> = (event, { mirror }) => {
  const $target = mirror.getNode<HTMLInputElement>(event.id);

  if (!$target) return;

  if (typeof event.value === 'boolean') {
    $target.checked = event.value;
  } else {
    $target.value = event.value;
  }
};
