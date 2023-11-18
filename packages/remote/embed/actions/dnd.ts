import { ReceiveHandler } from '@mood/replay';
import { SubscribeToDndArg } from '../../mirror/observers/dnd';
import { mirror } from '@mood/snapshot';
import { createEvent } from '../../utils/event';

export const receiveToDnd: ReceiveHandler<SubscribeToDndArg> = (ev, context) => {
  const node = mirror.getNode(ev.id);
  createEvent(node || context.$iframe.ownerDocument, 'drag');
};
