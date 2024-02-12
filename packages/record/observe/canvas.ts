import { Decodeable, decode, encode } from '@mood/rendering-context';
import { FunctionKeys, NonFunctionKeys } from 'utility-types';
import { hookMethod, hookProp, throttle } from '@mood/utils';
import { ObserveHandler, SourceTypes } from '../types';
import { canvas2DFuncs, canvas2DProps } from '../utils';

export type CanvasEmitArg = {
  id: number;
  source: SourceTypes.CANVAS;
  ops: Array<{
    key: FunctionKeys<CanvasRenderingContext2D> | NonFunctionKeys<CanvasRenderingContext2D>;
    value: Decodeable;
    setter: boolean;
  }>;
};

export const observeCanvas: ObserveHandler<CanvasEmitArg> = (cb, { mirror }) => {
  const buffer = new WeakMap<CanvasRenderingContext2D, CanvasEmitArg['ops']>();

  const maybeEmit = throttle(async (context: CanvasRenderingContext2D) => {
    const id = mirror.getId(context.canvas);
    const ops = buffer.get(context);

    const width = context.canvas.width;
    const height = context.canvas.height;

    const start =
      ops?.findIndex(o => {
        if (o.key !== 'clearRect') return false;

        const [x, y, w, h] = decode(o.value as Parameters<typeof decode>[0], mirror) as Parameters<
          typeof CanvasRenderingContext2D.prototype.clearRect
        >;
        return x <= 0 && y <= 0 && w >= width && h >= height;
      }) || 0;

    if (ops?.length && id && start < ops.length) {
      cb({ id, source: SourceTypes.CANVAS, ops: ops.slice(start) });
      buffer.delete(context);
    }
  }, 40);

  const unsubscribes = [
    canvas2DFuncs.map(key =>
      hookMethod(
        CanvasRenderingContext2D.prototype,
        key,
        async function (_: unknown, ...args: unknown[]) {
          const context = this as CanvasRenderingContext2D;
          const ops = buffer.get(context) || [];
          try {
            ops.push({
              setter: false,
              key,
              value: encode(args as Parameters<typeof encode>[0], mirror)
            });
            buffer.set(context, ops);
            maybeEmit(context);
          } catch {}
        }
      )
    ),

    canvas2DProps.map(key =>
      hookProp(CanvasRenderingContext2D.prototype, key, function (value: unknown) {
        const context = this as CanvasRenderingContext2D;
        const ops = buffer.get(context) || [];
        try {
          ops.push({
            setter: true,
            key: key,
            value: encode(value as Parameters<typeof encode>[0], mirror, context)
          });
          buffer.set(context, ops);
          maybeEmit(context);
        } catch {}
      })
    )
  ].flat();

  return () => unsubscribes.forEach(fn => fn());
};
