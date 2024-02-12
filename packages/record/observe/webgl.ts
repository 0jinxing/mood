import { ObserveHandler, SourceTypes } from '../types';
import { Decodeable, encode, saveWebGLObjectIfValid } from '@mood/rendering-context';
import { hookMethod, hookProp, throttle } from '@mood/utils';
import { webGL2Funcs, webGL2Props, webGLFuncs, webGLProps } from '../utils';

export type WebGLEmitArg = {
  id: number;
  source: SourceTypes.WEBGL;
  webgl2: boolean;
  ops: Array<{ key: string; value: Decodeable; setter: boolean }>;
};

export const observeWebGL: ObserveHandler<WebGLEmitArg> = (cb, { mirror }) => {
  const buffer = new WeakMap<RenderingContext, WebGLEmitArg['ops']>();

  const maybeEmit = throttle(function (context: RenderingContext) {
    const id = mirror.getId(context.canvas);
    const ops = buffer.get(context);
    const webgl2 = context instanceof WebGL2RenderingContext;

    if (ops?.length && id) {
      cb({ webgl2, id, source: SourceTypes.WEBGL, ops });
      buffer.delete(context);
    }
  }, 40);

  const unsubscribes = [
    webGL2Funcs.map(key =>
      hookMethod(
        WebGL2RenderingContext.prototype,
        key,
        function (result: unknown, ...args: unknown[]) {
          saveWebGLObjectIfValid(this, result);
          const ops = buffer.get(this) || [];
          ops.push({ key, value: encode(args, mirror, this), setter: true });
          maybeEmit(this);
        }
      )
    ),
    webGLFuncs.map(key =>
      hookMethod(
        WebGLRenderingContext.prototype,
        key,
        function (result: unknown, ...args: unknown[]) {
          saveWebGLObjectIfValid(this, result);
          const ops = buffer.get(this) || [];

          ops.push({ key, value: encode(args, mirror, this), setter: true });

          buffer.set(this, ops);
          maybeEmit(this);
        }
      )
    ),
    webGL2Props.map(key =>
      hookProp(WebGL2RenderingContext.prototype, key, function (value) {
        const ops = buffer.get(this) || [];
        ops.push({ key, value: encode(value, mirror, this), setter: false });
        buffer.set(this, ops);
        maybeEmit(this);
      })
    ),
    webGLProps.map(key =>
      hookProp(WebGLRenderingContext.prototype, key, function (value) {
        const ops = buffer.get(this) || [];

        ops.push({ key, value: encode(value, mirror, this), setter: false });

        buffer.set(this, ops);
        maybeEmit(this);
      })
    )
  ].flat();

  return () => unsubscribes.forEach(h => h());
};
