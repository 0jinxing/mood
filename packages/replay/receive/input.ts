import { mirror } from '@mood/snapshot';
import { SubscribeToInputArg } from '@mood/record';
import { ReceiveHandler } from '../types';

export const receiveToInput: ReceiveHandler<SubscribeToInputArg> = event => {
  const $target = mirror.getNode<HTMLInputElement>(event.id);

  if (!$target) return;

  if (typeof event.value === 'boolean') {
    $target.checked = event.value;
  } else {
    $target.value = event.value;
  }
  if ($target.type === 'radio' && $target.name && event.value) {
    const selector = `input[type=radio][name=${$target.name}]`;
    const $radioList: NodeListOf<HTMLInputElement> = document.querySelectorAll(selector);
    $radioList.forEach($el => {
      if (!$el.checked || $el === $target) return;
      $el.checked = false;
    });
  }
};
