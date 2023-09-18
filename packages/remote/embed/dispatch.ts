import { SourceTypes } from '@mood/record';
import { DispatchEmitArg } from '../client/dispatch';

export function dispatchEvent(arg: DispatchEmitArg) {
  if (arg.source === SourceTypes.MOUSE_MOVE) {
  } else if (arg.source === SourceTypes.INPUT) {
  } else if (arg.source === SourceTypes.SCROLL) {
  }
}
