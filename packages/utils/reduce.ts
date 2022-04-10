import { each } from './each';

export type ReduceHandler<T, R> = (result: R, item: T, index: number) => R;

export function reduce<T, R>(
  like: ArrayLike<T>,
  handler: ReduceHandler<T, R>,
  result: R,
  reverse = false
) {
  let next = result;
  const wrapHandler = (item: T, index: number) => {
    next = handler(next, item, index);
  };

  each(like, wrapHandler, reverse);
  return next;
}
