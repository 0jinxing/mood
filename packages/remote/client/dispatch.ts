import {
  MediaInteractionArg,
  SubscribeToInputArg,
  SubscribeToMouseInteractionArg,
  SubscribeToMouseMoveArg,
  SubscribeToScrollArg,
  SubscribeToSelectionArg,
  subscribeToInput,
  subscribeToMediaInteraction
} from '@mood/record';
import { Mirror } from '@mood/snapshot';

export type DispatchEmitArg =
  | SubscribeToMouseMoveArg
  | SubscribeToMouseInteractionArg
  | SubscribeToScrollArg
  | SubscribeToInputArg
  | MediaInteractionArg
  | SubscribeToSelectionArg;

export type DispatchHandler = (arg: DispatchEmitArg) => void;

export const onDispatch = (mirror: Mirror, doc: Document, cb: DispatchHandler) => {
  subscribeToInput(cb, doc);
  subscribeToMediaInteraction(cb, doc);
};
