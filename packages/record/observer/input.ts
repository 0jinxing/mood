import { hookSetter, on } from '../utils';
import { mirror } from '@mood/snapshot';

export type InputValue = string | boolean;

export type InputCallbackParam = { id: number; value: InputValue };

export type InputCallback = (param: InputCallbackParam) => void;

const lastInputValueMap: WeakMap<EventTarget, InputValue> = new WeakMap();

function initInputObserver(callback: InputCallback) {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: InputValue
  ) => {
    const lastInputValue = lastInputValueMap.get($target);
    if (!lastInputValue || lastInputValue !== value) {
      lastInputValueMap.set($target, value);
      const id = mirror.getId($target);
      callback({ value, id });
    }
  };

  const eventHandler = (event: Event) => {
    const { target: $target } = event;

    if (
      !($target instanceof HTMLTextAreaElement) &&
      !($target instanceof HTMLSelectElement) &&
      !($target instanceof HTMLInputElement)
    ) {
      return;
    }

    const value: InputValue =
      $target instanceof HTMLInputElement
        ? $target.value || $target.checked
        : $target.value;
    cbWithDedup($target, value);
    const inputType = $target.type;
    const name = $target.name;
    if (inputType === 'radio' && name && value) {
      const selector = `input[type=radio][name=${name}]`;
      const $$radio = document.querySelectorAll(selector);

      $$radio.forEach($el => {
        $el !== $target && cbWithDedup($el as HTMLInputElement, !value);
      });
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

export default initInputObserver;
