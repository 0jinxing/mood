import { CanvasEmitArg } from '@mood/record';
import { EmitHandler } from '../types';
import { decode } from '@mood/rendering-context';

export const handleRenderingContext2DEmit: EmitHandler<CanvasEmitArg> = (event, { mirror }) => {
  const context = (mirror.getNode(event.id) as HTMLCanvasElement)?.getContext('2d');

  for (const op of event.ops) {
    const prop = context?.[op.key];
    try {
      if (prop && typeof prop === 'function') {
        prop.apply(context, decode(op.value, mirror));
      } else if (context) {
        Object.assign(context, { [op.key]: decode(op.value, mirror) });
      }
    } catch {}
  }
};
