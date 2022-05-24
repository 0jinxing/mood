import { NonFunctionKeys } from 'utility-types';
import { mirror, isElement } from '@mood/snapshot';
import { hookProp, on, each } from '@mood/utils';
import { SourceType } from '../types';

export type SubscribeToInputValue = string | boolean;

export type SubscribeToInputArg = {
  source: SourceType.INPUT;
  id: number;
  value: SubscribeToInputValue;
};

export type SubscribeToInputEmit = (arg: SubscribeToInputArg) => void;

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isInputElement($el: EventTarget | Node): $el is InputElement {
  return isElement($el, 'input') || isElement($el, 'textarea') || isElement($el, 'select');
}

export function subscribeToInput(cb: SubscribeToInputEmit) {
  const cbWithDedup = ($target: InputElement, value: SubscribeToInputValue) => {
    cb({ source: SourceType.INPUT, value, id: mirror.getId($target) });
  };

  const eventHandler = (event: Pick<Event, 'target'>) => {
    const { target: $target } = event;

    if (!$target || !isInputElement($target)) return;

    const value: SubscribeToInputValue = isElement($target, 'input')
      ? $target.value || $target.checked
      : $target.value;

    cbWithDedup($target, value);
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

  type Properties<T extends object = any> = [prototype: T, key: NonFunctionKeys<T>];

  const hookHandlers = hookProperties.map(([prototype, key]: Properties) =>
    hookProp(prototype, key, function () {
      eventHandler({ target: this });
    })
  );

  unsubscribes.push(...hookHandlers);

  return () => each(unsubscribes, u => u());
}
