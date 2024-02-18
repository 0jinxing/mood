import { EmitHandler } from '@mood/replay';
import { SubscribeToDndArg } from '../../mirror/observe/dnd';
import { createEvent } from '../../utils/event';

export const receiveToDnd: EmitHandler<SubscribeToDndArg> = (ev, { mirror, $iframe }) => {
  const node = mirror.getNode(ev.id);
  createEvent(node || $iframe.ownerDocument, 'drag');
};
