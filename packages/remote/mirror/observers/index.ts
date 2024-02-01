import {
  SubscribeToMediaInteractionArg,
  SubscribeToInputArg,
  SubscribeToMouseInteractionArg,
  SubscribeToMouseMoveArg,
  SubscribeToScrollArg,
  SubscribeToSelectionArg,
  $$input,
  $$mediaInteraction
} from '@mood/record';
import { Mirror } from '@mood/snapshot';
import { SubscribeToDndArg, subscribeToDragAndDrop } from './dnd';

export type DispatchArg =
  | SubscribeToMouseMoveArg
  | SubscribeToMouseInteractionArg
  | SubscribeToScrollArg
  | SubscribeToInputArg
  | SubscribeToMediaInteractionArg
  | SubscribeToSelectionArg
  | SubscribeToDndArg;

export type DispatchHandler = (arg: DispatchArg) => void;

export const onDispatch = (mirror: Mirror, doc: Document, cb: DispatchHandler) => {
  $$input(cb, doc);
  $$mediaInteraction(cb, doc);
  subscribeToDragAndDrop(cb, doc);
};
