import { ObserveFunc } from '@mood/record';

export type KeyboardAndMouseEmitArg = {
  event: 'keydown' | 'keypress' | 'mousedown' | 'mouseup';
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

export const observeKeyboardAndMouse: ObserveFunc<KeyboardAndMouseEmitArg> = (emit, options) => {
  return () => {};
};
