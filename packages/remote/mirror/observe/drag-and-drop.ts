export type DragAndDropEvtTypes =
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragexit'
  | 'dragleave'
  | 'dragover'
  | 'dragstart'
  | 'drop';

export type DragAndDropEvtArg = {
  type: DragAndDropEvtTypes;
} & Pick<
  DragEvent,
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
