import { NonFunctionKeys, FunctionKeys } from 'utility-types';

export function hook<T extends object>(target: T, key: keyof T, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, descriptor);

  return () => Object.defineProperty(target, key, original || {});
}

export function hookProp<T extends object, K extends NonFunctionKeys<T>, V extends T[K]>(
  target: T,
  key: K,
  setter: (val: V) => void
) {
  const raw = Object.getOwnPropertyDescriptor(target, key);

  const set = function (val: unknown) {
    raw?.set?.call(this, val);
    setter.call(this, val);
  };

  return hook(target, key, { set });
}

export function hookMethod<T extends object, K extends FunctionKeys<T>, F extends T[K]>(
  target: T,
  key: K,
  hoc: F extends (...args: unknown[]) => void
    ? (result: ReturnType<F>, ...args: Parameters<F>) => unknown
    : never
) {
  const raw = Object.getOwnPropertyDescriptor(target, key);
  const fn: Function = raw?.value;

  if (typeof fn !== 'function' || typeof hoc !== 'function') {
    throw new Error('Failed to hook method');
  }

  const value = function (...args: unknown[]) {
    const result = fn.apply(this, args);
    hoc.apply(this, [result, ...args]);
    return result;
  };

  return hook(target, key, { ...raw, value });
}
