import { ObserveFunc } from '@mood/record';
import { on } from '@mood/utils';

export type KeyboardEventTypes = 'keydown' | 'keypress' | 'keyup';

export type KeyEvtArg = {
  ctor: 'KeyboardEvent';
  name: KeyboardEventTypes;
  target: number;
} & Pick<
  KeyboardEvent,
  | 'altKey'
  | 'shiftKey'
  | 'metaKey'
  | 'ctrlKey'
  | 'code'
  | 'keyCode'
  | 'charCode'
  | 'isComposing'
  | 'location'
  | 'repeat'
>;

export const observeKeyboard: ObserveFunc<KeyEvtArg> = (emit, options) => {
  const genKeyboardHandler = (event: KeyboardEventTypes) => {
    return (e: KeyboardEvent) => {
      const {
        altKey,
        shiftKey,
        metaKey,
        ctrlKey,
        code,
        keyCode,
        charCode,
        isComposing,
        location,
        repeat
      } = e;
      emit({
        ctor: 'KeyboardEvent',
        name: event,
        altKey,
        shiftKey,
        metaKey,
        ctrlKey,
        code,
        keyCode,
        charCode,
        isComposing,
        location,
        repeat,
        target: options.mirror.getId(e.target)
      });
    };
  };

  const eventTypes: KeyboardEventTypes[] = ['keydown', 'keypress', 'keyup'];
  const unsubscribes = eventTypes.map(event => on(options.doc, event, genKeyboardHandler(event)));
  return () => unsubscribes.map(h => h());
};
