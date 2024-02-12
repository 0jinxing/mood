import { on } from '@mood/utils';
import { DispatchType } from './types';
import { Mirror } from '@mood/snapshot';

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

const DND_LISTENER_MAP = {
  dragstart: DragAndDropAction.DragStart,
  drag: DragAndDropAction.Drag,
  dragenter: DragAndDropAction.DragEnter,
  dragleave: DragAndDropAction.DragLeave,
  dragover: DragAndDropAction.DragOver,
  drop: DragAndDropAction.Drop,
  dragend: DragAndDropAction.DragEnd
} as const;

export const $$dragAndDrop = (
  cb: SubscribeToDndEmit,
  { doc, mirror }: { doc: Document; mirror: Mirror }
) => {
  const keys = Object.keys(DND_LISTENER_MAP) as Array<keyof typeof DND_LISTENER_MAP>;

  keys.map(key => {
    on(doc || document, key, ev => {
      cb({
        source: DispatchType.DragAndDrop,
        action: DND_LISTENER_MAP[key],
        id: mirror.getId(ev.target),
        x: ev.clientX,
        y: ev.clientY
      });
    });
  });
};
