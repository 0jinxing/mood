import {
  MediaInteractionEmitArg,
  InputEmitArg,
  MouseInteractionEmitArg,
  MouseMoveEmitArg,
  ScrollEmitArg,
  SelectionEmitArg,
  $$input,
  $$mediaInteraction
} from '@mood/record';
import { Mirror } from '@mood/snapshot';
import { SubscribeToDndArg, subscribeToDragAndDrop } from './dnd';

export type DispatchArg =
  | MouseMoveEmitArg
  | MouseInteractionEmitArg
  | ScrollEmitArg
  | InputEmitArg
  | MediaInteractionEmitArg
  | SelectionEmitArg
  | SubscribeToDndArg;

export type DispatchHandler = (arg: DispatchArg) => void;

export const onDispatch = (mirror: Mirror, doc: Document, cb: DispatchHandler) => {
  $$input(cb, doc);
  $$mediaInteraction(cb, doc);
  subscribeToDragAndDrop(cb, doc);
};
