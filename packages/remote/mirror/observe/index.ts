import {
  MediaInteractionEmitArg,
  InputEmitArg,
  MouseInteractionEmitArg,
  MouseMoveEmitArg,
  ScrollEmitArg,
  SelectionEmitArg,
  observeInput,
  observeMediaInteraction,
  observeScroll
} from '@mood/record';
import { Mirror } from '@mood/snapshot';
import { SubscribeToDndArg, $$dragAndDrop } from './dnd';

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
  observeScroll(cb, { doc, mirror });
};
