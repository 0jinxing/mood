import { NonFunctionKeys, FunctionKeys } from 'utility-types';

export function hook<T extends object>(target: T, key: keyof T, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, descriptor);

  return () => Object.defineProperty(target, key, original || {});
}

export function hookProp<T extends object>(
  target: T,
  key: NonFunctionKeys<T>,
  setter: (val: any) => void
) {
  const original = Object.getOwnPropertyDescriptor(target, key);

  const set = function (val: unknown) {
    original?.set?.call(this, val);
    setter.call(this, val);
  };

  return hook(target, key, { set });
}

export function hookMethod<T extends object>(target: T, key: FunctionKeys<T>, hoc: Function) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  const fn: Function = original?.value;

  if (typeof fn !== 'function' || typeof hoc !== 'function') {
    throw new Error('Failed to hook method');
  }

  const value = function (...args: unknown[]) {
    const result = fn(...args);
    hoc(...args);
    return result;
  };

  return hook(target, key, { ...original, value });
}
