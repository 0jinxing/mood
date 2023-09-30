import { on } from '@mood/utils';
import { DispatchType } from './types';
import { mirror } from '@mood/snapshot';

export enum DragAndDropAction {
  DragStart,
  Drag,
  DragEnter,
  DragLeave,
  DragOver,
  Drop,
  DragEnd
}

export type SubscribeToDndArg = {
  source: DispatchType.DragAndDrop;
  action: DragAndDropAction;
  id: number;
  x: number;
  y: number;
};

export type SubscribeToDndEmit = (arg: SubscribeToDndArg) => void;

export function subscribeToDragAndDrop(cb: SubscribeToDndEmit, doc?: Document) {
  const listenerMap = {
    dragstart: DragAndDropAction.DragStart,
    drag: DragAndDropAction.Drag,
    dragenter: DragAndDropAction.DragEnter,
    dragleave: DragAndDropAction.DragLeave,
    dragover: DragAndDropAction.DragOver,
    drop: DragAndDropAction.Drop,
    dragend: DragAndDropAction.DragEnd
  } as const;

  const keys = Object.keys(listenerMap) as Array<keyof typeof listenerMap>;

  keys.map(key => {
    on(doc || document, key, ev => {
      cb({
        source: DispatchType.DragAndDrop,
        action: listenerMap[key],
        id: mirror.getId(ev.target),
        x: ev.clientX,
        y: ev.clientY
      });
    });
  });
}
