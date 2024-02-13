export type EcahHandler<T> = (item: T, index: number) => unknown;

export function each<T>(arr: ArrayLike<T>, handler: EcahHandler<T>, reverse = false) {
  let index = reverse ? arr.length - 1 : 0;

  while (reverse ? index >= 0 : index < arr.length) {
    handler(arr[index], index);
    index = reverse ? index - 1 : index + 1;
  }
}

export function lastIndexOf<T>(arr: ArrayLike<T>, predicate: (item: T) => boolean) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}

export function reduce<T, R>(
  like: ArrayLike<T>,
  handler: (result: R, item: T, index: number) => R,
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
