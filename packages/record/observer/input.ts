import { mirror } from '@mood/snapshot';
import { IncrementalSource } from '../constant';
import { hookSetter, on } from '../utils';

export type InputValue = string | boolean;

export type InputData = {
  source: IncrementalSource.INPUT;
  id: number;
  value: InputValue;
};

export type InputCb = (param: InputData) => void;

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

export function inputObserve(cb: InputCb) {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: InputValue
  ) => {
    const lastInputValue = lastInputValueMap.get($target);

    if (lastInputValue && lastInputValue === value) return;

    lastInputValueMap.set($target, value);
    const id = mirror.getId($target);
    cb({ source: IncrementalSource.INPUT, value, id });
  };

  const eventHandler = (event: Event) => {
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

      const $$radio: NodeListOf<HTMLInputElement> = document.querySelectorAll(
        selector
      );

      // toggle
      for (const $el of Array.from($$radio)) {
        if (!$el.checked || $el === $target) return;
        cbWithDedup($el as HTMLInputElement, false);
      }
    }
  };

  const handlers = ['input', 'change'].map(eventName => {
    return on(eventName, eventHandler);
  });

  const hookProperties: Array<[HTMLElement, string]> = [
    [HTMLInputElement.prototype, 'value'],
    [HTMLInputElement.prototype, 'checked'],
    [HTMLSelectElement.prototype, 'value'],
    [HTMLTextAreaElement.prototype, 'value']
  ];

  const hookHandlers = hookProperties.map(([prototype, key]) =>
    hookSetter<HTMLElement>(prototype, key, {
      set() {
        eventHandler({ target: this } as Event);
      }
    })
  );
  handlers.push(...hookHandlers);

  return () => {
    handlers.forEach(h => h());
  };
}
