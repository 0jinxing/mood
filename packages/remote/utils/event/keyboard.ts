import { createEvent } from '.';

export type KeyboardEventCreateParams = {
  key: string;
  code: string;
  isComposing: boolean;
  location: number;
  repeat: boolean;

  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

export function createKeyboardEvent(
  elm: EventTarget,
  eventName: string,
  params: Partial<KeyboardEventCreateParams> = {}
) {}
