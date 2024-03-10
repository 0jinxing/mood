import { ObserveFunc } from '@mood/record';
import { on } from '@mood/utils';

export type MouseEvt =
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup';

export type MouseEvtArg = {
  ctor: 'MouseEvent';
  name: MouseEvt;
  target: number;
  relatedTarget: number;
} & Pick<
  MouseEvent,
  | 'altKey'
  | 'ctrlKey'
  | 'metaKey'
  | 'shiftKey'
  | 'movementX'
  | 'movementY'
  | 'offsetX'
  | 'offsetY'
  | 'pageX'
  | 'pageY'
  | 'screenX'
  | 'screenY'
  | 'button'
  | 'buttons'
  | 'clientX'
  | 'clientY'
>;

// drag and drop
export const observeMouse: ObserveFunc<MouseEvtArg> = (emit, options) => {
  const genMouseHandler = (event: MouseEvt) => {
    return (e: MouseEvent) => {
      const {
        altKey,
        ctrlKey,
        metaKey,
        shiftKey,
        movementX,
        movementY,
        offsetX,
        offsetY,
        pageX,
        pageY,
        screenX,
        screenY,
        clientX,
        clientY,
        button,
        buttons
      } = e;

      emit({
        ctor: 'MouseEvent',
        name: event,
        altKey,
        ctrlKey,
        metaKey,
        shiftKey,
        movementX,
        movementY,
        offsetX,
        offsetY,
        pageX,
        pageY,
        screenX,
        screenY,
        button,
        buttons,
        clientX,
        clientY,
        target: options.mirror.getId(e.target),
        relatedTarget: options.mirror.getId(e.relatedTarget)
      });
    };
  };
  const eventTypes: MouseEvt[] = [
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup'
  ];
  const unsubscribes = eventTypes.map(event => on(options.doc, event, genMouseHandler(event)));
  return () => unsubscribes.map(h => h());
};
