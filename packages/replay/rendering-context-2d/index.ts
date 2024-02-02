import { SubscribeToRenderingContext2DArg } from '@mood/record';
import { ReceiveHandler } from '../types';
import { mirror } from '@mood/snapshot';
import { decode } from '@mood/record/rendering-context-2d/encode';

export const receiveToRenderingContext2D: ReceiveHandler<
  SubscribeToRenderingContext2DArg
> = event => {
  const context = (mirror.getNode(event.id) as HTMLCanvasElement)?.getContext('2d');

  for (const op of event.ops) {
    const prop = context?.[op.key];
    try {
      if (prop && typeof prop === 'function') {
        prop.apply(context, decode(op.value));
      } else if (context) {
        Object.assign(context, { [op.key]: decode(op.value) });
      }
    } catch {}
  }
};
