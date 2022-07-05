import { hookMethod, hookProp } from 'packages/utils';
import { FunctionKeys, NonFunctionKeys } from 'utility-types';
import { hocGradien } from './gradient';
import { hocPath2D } from './path2d';
import { hocPattern } from './pattern';

export type SubscribeToCanvase2DArg = {
  id: number;
  exec?: unknown[];
  assign?: Record<string, unknown>;
};

export type SubscribeToCanvas2DEmits = (arg: SubscribeToCanvase2DArg) => void;

export function subscribeToCanvas2D(cb: SubscribeToCanvas2DEmits) {
  const props = Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype) as Array<
    FunctionKeys<CanvasRenderingContext2D> | NonFunctionKeys<CanvasRenderingContext2D>
  >;
  let arg: SubscribeToCanvase2DArg | null = null;

  [
    hocGradien(),
    hocPath2D(),
    hocPattern(),
    ...props.map(key => {
      if (CanvasRenderingContext2D.prototype[key] instanceof Function) {
        return hookMethod(
          CanvasRenderingContext2D.prototype,
          key as FunctionKeys<CanvasRenderingContext2D>,
          (...args: unknown[]) => {}
        );
      } else {
        return hookProp(
          CanvasRenderingContext2D.prototype,
          key as NonFunctionKeys<CanvasRenderingContext2D>,
          function (...args) {}
        );
      }
    })
  ].map(h => h());
}
