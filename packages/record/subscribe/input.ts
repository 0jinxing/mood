import { NonFunctionKeys } from 'utility-types';
import { mirror } from '@mood/snapshot';

import { SOURCE } from '../constant';
import { hookProp, on } from '../utils';
import { each } from '@mood/utils';

export type InputValue = string | boolean;

export type InputParam = {
  source: SOURCE.INPUT;
  id: number;
  value: InputValue;
};

export type InputCallback = (param: InputParam) => void;

const lastInputValueMap: WeakMap<EventTarget, InputValue> = new WeakMap();

function isInputElement(
  $el: HTMLElement | EventTarget | Node
): $el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    $el instanceof HTMLTextAreaElement ||
    $el instanceof HTMLSelectElement ||
    $el instanceof HTMLInputElement
  );
}

export function subInput(cb: InputCallback) {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: InputValue
  ) => {
    const lastInputValue = lastInputValueMap.get($target);

    if (lastInputValue && lastInputValue === value) return;

    lastInputValueMap.set($target, value);
    const id = mirror.getId($target);
    cb({ source: SOURCE.INPUT, value, id });
  };

  const eventHandler = (event: Pick<Event, 'target'>) => {
    const { target: $target } = event;

    if (!$target || !isInputElement($target)) return;

    const value: InputValue =
      $target instanceof HTMLInputElement
        ? $target.value || $target.checked
        : $target.value;

    cbWithDedup($target, value);

    const inputType = $target.type;
    const name = $target.name;
    if (inputType === 'radio' && name && value) {
      const selector = `input[type=radio][name=${name}]`;

      const $$radio: NodeListOf<HTMLInputElement> =
        document.querySelectorAll(selector);

      // toggle
      each($$radio, $el => {
        if (!$el.checked || $el === $target) return true;
        cbWithDedup($el as HTMLInputElement, false);
      });
    }
  };

  const unsubscribes = ['input', 'change'].map(eventName => {
    return on(eventName, eventHandler);
  });

  const hookProperties: Array<[HTMLElement, string]> = [
    [HTMLInputElement.prototype, 'value'],
    [HTMLInputElement.prototype, 'checked'],
    [HTMLSelectElement.prototype, 'value'],
    [HTMLTextAreaElement.prototype, 'value']
  ];

  type Properties<T extends object = any> = [
    prototype: T,
    key: NonFunctionKeys<T>
  ];
  const hookHandlers = hookProperties.map(([prototype, key]: Properties) =>
    hookProp(prototype, key, function () {
      eventHandler({ target: this });
    })
  );
  unsubscribes.push(...hookHandlers);

  return () => {
    unsubscribes.forEach(h => h());
  };
}
