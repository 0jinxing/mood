// https://github.com/testing-library/dom-testing-library/blob/2653fd934f33ce19377c98029efe3e983a1c602b/src/events.js

import { eventMap } from './event-map';

export function createEvent(
  elm: EventTarget,
  eventName: keyof typeof eventMap,
  init: EventInit = {}
) {
  const { EventType, defaultInit } = eventMap[eventName] || { EventType: 'Event', defaultInit: {} };
  const eventInit: Record<string, unknown> = { ...defaultInit, ...init };

  const { target: { value, files, ...targetProperties } = {} } = eventInit as {
    target?: HTMLInputElement;
  };

  Object.assign(elm, targetProperties);
  const currentGlobalThis = getGlobalFromEventTarget(elm);

  const EventConstructor = currentGlobalThis[EventType] || currentGlobalThis.Event;
  const event = new EventConstructor(eventName, eventInit);

  if (value !== undefined) {
    nativeValue(elm, value);
  }
  if (files !== undefined) {
    // input.files is a read-only property so this is not allowed:
    // input.files = [file]
    // so we have to use this workaround to set the property
    Object.defineProperty(elm, 'files', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: files
    });
  }

  // DataTransfer is not supported in jsdom: https://github.com/jsdom/jsdom/issues/1568
  const dataTransferProperties = ['dataTransfer', 'clipboardData'];
  dataTransferProperties.forEach(dataTransferKey => {
    const dataTransferValue = eventInit[dataTransferKey] as Record<string, unknown>;
    if (typeof dataTransferValue === 'object') {
      /* istanbul ignore if  */
      if (typeof currentGlobalThis.DataTransfer === 'function') {
        Object.defineProperty(event, dataTransferKey, {
          value: Object.getOwnPropertyNames(dataTransferValue).reduce((acc, propName) => {
            Object.defineProperty(acc, propName, { value: dataTransferValue?.[propName] });
            return acc;
          }, new currentGlobalThis.DataTransfer())
        });
      } else {
        Object.defineProperty(event, dataTransferKey, { value: dataTransferValue });
      }
    }
  });
}

// function written after some investigation here:
// https://github.com/facebook/react/issues/10135#issuecomment-401496776
export function nativeValue(elm: EventTarget, value: unknown) {
  const { set: valueSetter } = Object.getOwnPropertyDescriptor(elm, 'value') || {};
  const prototype = Object.getPrototypeOf(elm);

  const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(elm, value);
  } else {
    /* istanbul ignore if */
    // eslint-disable-next-line no-lonely-if -- Can't be ignored by istanbul otherwise
    if (valueSetter) {
      valueSetter.call(elm, value);
    } else {
      throw new Error('The given element does not have a value setter');
    }
  }
}

export function getGlobalFromEventTarget(node: Document | HTMLElement | Window | EventTarget) {
  if ('defaultView' in node && node.defaultView) {
    // node is document
    return node.defaultView;
  } else if ('ownerDocument' in node && node.ownerDocument && node.ownerDocument.defaultView) {
    // node is a DOM node
    return node.ownerDocument.defaultView;
  } else if ('window' in node) {
    // node is window
    return node.window;
  }
  return window;
}
