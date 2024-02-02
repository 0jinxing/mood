import { hookMethod, hookProp } from '@mood/utils';
import { Decodeable, decode, encode } from './encode';
import { CanvasRenderingContext2DMethods, CanvasRenderingContext2DProperties } from './defs';
import { SourceTypes } from '../types';
import { FunctionKeys, NonFunctionKeys } from 'utility-types';
import { throttle } from '@mood/utils';
import { mirror } from '@mood/snapshot';

export type Rendering2DOp = {
  key: FunctionKeys<CanvasRenderingContext2D> | NonFunctionKeys<CanvasRenderingContext2D>;
  value: Decodeable;
};

export type SubscribeToRenderingContext2DArg = {
  id: number;
  source: SourceTypes.CONTEXT_2D;
  ops: Rendering2DOp[];
};

export type SubscribeToRenderingContext2DHandler = (arg: SubscribeToRenderingContext2DArg) => void;

export function $$renderingContext2D(cb: SubscribeToRenderingContext2DHandler) {
  const store = new WeakMap<CanvasRenderingContext2D, Rendering2DOp[]>();

  const maybeEmit = throttle((context: CanvasRenderingContext2D) => {
    const ops = store.get(context);
    const id = mirror.getId(context.canvas);

    const width = context.canvas.width;
    const height = context.canvas.height;

    const start =
      ops?.findIndex(o => {
        if (o.key !== 'clearRect') return false;

        const [x, y, w, h] = decode(o.value as Parameters<typeof decode>) as Parameters<
          typeof CanvasRenderingContext2D.prototype.clearRect
        >;
        return x <= 0 && y <= 0 && w >= width && h >= height;
      }) || 0;

    if (ops?.length && id && start < ops.length) {
      cb({ id, source: SourceTypes.CONTEXT_2D, ops: ops.slice(start) });
      store.delete(context);
    }
  }, 1000 / 24);

  const unsubscribes = [
    CanvasRenderingContext2DMethods.map(key =>
      hookMethod(
        CanvasRenderingContext2D.prototype,
        key,
        function (_: unknown, ...args: unknown[]) {
          const context = this as CanvasRenderingContext2D;
          const ops = store.get(context) || [];
          try {
            ops.push({ key, value: encode(args as Parameters<typeof encode>) });
            store.set(context, ops);
            maybeEmit(context);
          } catch {}
        }
      )
    ),

    CanvasRenderingContext2DProperties.map(key =>
      hookProp(CanvasRenderingContext2D.prototype, key, function (value: unknown) {
        const context = this as CanvasRenderingContext2D;
        const ops = store.get(context) || [];
        try {
          ops.push({ key, value: encode(value as Parameters<typeof encode>) });
          store.set(context, ops);
          maybeEmit(context);
        } catch {}
      })
    )
  ].flat();

  return () => unsubscribes.forEach(fn => fn());
}
