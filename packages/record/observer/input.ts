import { on } from "../utils";
import { mirror } from "@traps/snapshot";

import {
  HookResetter,
  InputValue,
  InputCallback,
  ListenerHandler,
} from "../types";

function hookSetter<T>(
  target: T,
  key: string | number | symbol,
  descriptor: PropertyDescriptor,
  isRevoked?: boolean
): HookResetter {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(
    target,
    key,
    isRevoked
      ? descriptor
      : {
          set(value) {
            // put hooked setter into event loop to avoid of set latency
            setTimeout(() => {
              descriptor.set!.call(this, value);
            }, 0);
            original && original.set && original.set.call(this, value);
          },
        }
  );
  return () => hookSetter(target, key, original || {}, true);
}

const lastInputValueMap: WeakMap<EventTarget, InputValue> = new WeakMap();

function initInputObserver(cb: InputCallback): ListenerHandler {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: InputValue
  ) => {
    const lastInputValue = lastInputValueMap.get($target);
    if (!lastInputValue || lastInputValue !== value) {
      lastInputValueMap.set($target, value);
      const id = mirror.getId($target);
      cb({ value, id });
    }
  };

  const eventHandler = (event: Event) => {
    const { target } = event;

    if (
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement) &&
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const value: InputValue =
      target instanceof HTMLInputElement
        ? target.value || target.checked
        : target.value;
    cbWithDedup(target, value);
    const inputType = target.type;
    const name = target.name;
    if (inputType === "radio" && name && value) {
      const $$radio = document.querySelectorAll(
        `input[type=radio][name=${name}]`
      );
      $$radio.forEach(($el) => {
        $el !== target && cbWithDedup($el as HTMLInputElement, !value);
      });
    }
  };

  const handlers: Array<ListenerHandler | HookResetter> = [
    "input",
    "change",
  ].map((eventName) => {
    return on(eventName, eventHandler);
  });

  const hookProperties: Array<[HTMLElement, string]> = [
    [HTMLInputElement.prototype, "value"],
    [HTMLInputElement.prototype, "checked"],
    [HTMLSelectElement.prototype, "value"],
    [HTMLTextAreaElement.prototype, "value"],
  ];

  const hookHandlers = hookProperties.map(([$target, key]) =>
    hookSetter<HTMLElement>($target, key, {
      set() {
        eventHandler({ target: this } as Event);
      },
    })
  );
  handlers.push(...hookHandlers);

  return () => {
    handlers.forEach((h) => h());
  };
}

export default initInputObserver;
