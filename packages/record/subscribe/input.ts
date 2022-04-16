import { NonFunctionKeys } from 'utility-types';
import { mirror } from '@mood/snapshot';

import { hookProp, on } from '../utils';
import { each } from '@mood/utils';
import { SourceType } from '../types';

export type SubscribeToInputValue = string | boolean;

export type SubscribeToInputArg = {
  source: SourceType.INPUT;
  id: number;
  value: SubscribeToInputValue;
};

export type SubscribeToInputEmit = (arg: SubscribeToInputArg) => void;

const cache: WeakMap<EventTarget, SubscribeToInputValue> = new WeakMap();

function isInputElement(
  $el: HTMLElement | EventTarget | Node
): $el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    $el instanceof HTMLTextAreaElement ||
    $el instanceof HTMLSelectElement ||
    $el instanceof HTMLInputElement
  );
}

export function subscribeToInput(cb: SubscribeToInputEmit) {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: SubscribeToInputValue
  ) => {
    const oldValue = cache.get($target);

    if (oldValue && oldValue === value) return;

    cache.set($target, value);
    const id = mirror.getId($target);
    cb({ source: SourceType.INPUT, value, id });
  };

  const eventHandler = (event: Pick<Event, 'target'>) => {
    const { target: $target } = event;

    if (!$target || !isInputElement($target)) return;

    const value: SubscribeToInputValue =
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
