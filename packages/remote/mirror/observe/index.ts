import { Mirror } from '@mood/snapshot';
import { KeyEvtArg, observeKeyboard } from './keyboard';
import { MouseEvtArg } from './mouse';
import { ScrollEvtArg, observeScroll } from './scroll';

export type DispatchArg = ScrollEvtArg | KeyEvtArg | MouseEvtArg;

export type DispatchHandler = (arg: DispatchArg) => void;

export const onDispatch = (mirror: Mirror, doc: Document, cb: DispatchHandler) => {
  observeScroll(cb, { doc, mirror });
  observeKeyboard(cb, { doc, mirror });
  observeKeyboard(cb, { doc, mirror });
};
