import { hookMethod, hookProp } from '@mood/utils';
import { Decodeable, encode } from './encode';
import { CanvasRenderingContext2DMethods, CanvasRenderingContext2DProperties } from './defs';
import { SourceTypes } from '../types';
import { mirror } from '@mood/snapshot';
import { FunctionKeys, NonFunctionKeys } from 'utility-types';

export type SubscribeToRenderingContext2DArg = {
  id: number;
  key: FunctionKeys<CanvasRenderingContext2D> | NonFunctionKeys<CanvasRenderingContext2D>;
  source: SourceTypes.CONTEXT2D;
  value: Decodeable;
};

export type SubscribeToRenderingContext2DHandler = (arg: SubscribeToRenderingContext2DArg) => void;

export function $$renderingContext2D(cb: SubscribeToRenderingContext2DHandler) {
  const unsubscribes = [
    CanvasRenderingContext2DMethods.map(key =>
      hookMethod(
        CanvasRenderingContext2D.prototype,
        key,
        function (_: unknown, ...args: unknown[]) {
          const self = this as CanvasRenderingContext2D;
          try {
            console.log('CanvasRenderingContext2D render', mirror.getId(self.canvas), key, args);
            cb({
              id: mirror.getId(self.canvas),
              key,
              source: SourceTypes.CONTEXT2D,
              value: encode(args as Parameters<typeof encode>)
            });
          } catch (e) {
            console.error(e, key, args);
          }
        }
      )
    ),
    CanvasRenderingContext2DProperties.map(key =>
      hookProp(CanvasRenderingContext2D.prototype, key, function (value: unknown) {
        const self = this as CanvasRenderingContext2D;
        try {
          cb({
            id: mirror.getId(self.canvas),
            source: SourceTypes.CONTEXT2D,
            key,
            value: encode(value as Parameters<typeof encode>)
          });
        } catch (e) {
          console.error(e, key, value);
        }
      })
    )
  ].flat();

  return () => unsubscribes.forEach(fn => fn());
}
