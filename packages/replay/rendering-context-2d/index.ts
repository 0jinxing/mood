import { SubscribeToRenderingContext2DArg } from '@mood/record';
import { ReceiveHandler } from '../types';
import { mirror } from '@mood/snapshot';
import { decode } from '@mood/record/rendering-context-2d/encode';

export const receiveToRenderingContext2D: ReceiveHandler<
  SubscribeToRenderingContext2DArg
> = event => {
  const { id, key, value } = event;
  const canvas = mirror.getNode(id) as HTMLCanvasElement;
  const context = canvas?.getContext('2d');

  const func = context?.[key];
  if (func && typeof func === 'function') {
    func.apply(context, decode(value));
  } else if (context) {
    // @ts-ignore
    context[key] = decode(value);
  }

  if (!context?.[key]) return;
};
