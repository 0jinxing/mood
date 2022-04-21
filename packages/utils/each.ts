export type EcahHandler<T> = (item: T, index: number) => boolean | void;

export function each<T>(like: ArrayLike<T>, handler: EcahHandler<T>, reverse = false) {
  const arr = Array.isArray(like) ? like : Array.from(like);

  let index = reverse ? arr.length - 1 : 0;

  while (reverse ? index >= 0 : index < arr.length) {
    if (handler(arr[index], index)) {
      break;
    }
    index = reverse ? index - 1 : index + 1;
  }
}
