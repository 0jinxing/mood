import { NonFunctionKeys } from 'utility-types';
import { hookProp, on, each } from '@mood/utils';
import { ObserveFunc, ST } from '../types';

export type SubscribeToInputValue = string | boolean;

export type InputEmitArg = {
  source: ST.INPUT;
  id: number;
  value: SubscribeToInputValue;
};

function isInputElement(
  $el: HTMLElement | EventTarget | Node
): $el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    $el instanceof HTMLTextAreaElement ||
    $el instanceof HTMLSelectElement ||
    $el instanceof HTMLInputElement
  );
}

export const observeInput: ObserveFunc<InputEmitArg> = (cb, { doc, mirror }) => {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: SubscribeToInputValue
  ) => {
    const id = mirror.getId($target);
    cb({ source: ST.INPUT, value, id });
  };

  const eventHandler = (event: Pick<Event, 'target'>) => {
    const { target: $target } = event;

    if (!$target || !isInputElement($target)) return;

    // @TODO <radio> <checkbox> <empty text>
    const value: SubscribeToInputValue =
      $target instanceof HTMLInputElement ? $target.value || $target.checked : $target.value;

    cbWithDedup($target, value);

    // @TODO
    // const inputType = $target.type;
    // const name = $target.name;
    // if (inputType === 'radio' && name && value) {
    //   const selector = `input[type=radio][name=${name}]`;

    //   const $radioList: NodeListOf<HTMLInputElement> = document.querySelectorAll(selector);

    //   // toggle
    //   each($radioList, $el => {
    //     if (!$el.checked || $el === $target) return true;
    //     cbWithDedup($el as HTMLInputElement, false);
    //   });
    // }
  };

  const unsubscribes = ['input', 'change'].map(eventName => {
    return on(doc || document, eventName, eventHandler);
  });

  const hookProperties: Array<[HTMLElement, string]> = [
    [HTMLInputElement.prototype, 'value'],
    [HTMLInputElement.prototype, 'checked'],
    [HTMLSelectElement.prototype, 'value'],
    [HTMLTextAreaElement.prototype, 'value']
  ];

  type Properties<T extends object = any> = [prototype: T, key: NonFunctionKeys<T>];
  const hookHandlers = hookProperties.map(([prototype, key]: Properties) =>
    hookProp(prototype, key, function () {
      eventHandler({ target: this });
    })
  );
  unsubscribes.push(...hookHandlers);

  return () => each(unsubscribes, u => u());
};
