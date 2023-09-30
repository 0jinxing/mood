import {
  SubscribeToMediaInteractionArg,
  SubscribeToInputArg,
  SubscribeToMouseInteractionArg,
  SubscribeToMouseMoveArg,
  SubscribeToScrollArg,
  SubscribeToSelectionArg,
  subscribeToInput,
  subscribeToMediaInteraction
} from '@mood/record';
import { Mirror } from '@mood/snapshot';
import { SubscribeToDndArg, subscribeToDragAndDrop } from './dnd';

export type DispatchEmitArg =
  | SubscribeToMouseMoveArg
  | SubscribeToMouseInteractionArg
  | SubscribeToScrollArg
  | SubscribeToInputArg
  | SubscribeToMediaInteractionArg
  | SubscribeToSelectionArg
  | SubscribeToDndArg;

export type DispatchHandler = (arg: DispatchEmitArg) => void;

export const onDispatch = (mirror: Mirror, doc: Document, cb: DispatchHandler) => {
  subscribeToInput(cb, doc);
  subscribeToMediaInteraction(cb, doc);
  subscribeToDragAndDrop(cb, doc);
};
