import { MethodKeys, PropKeys } from '../types';

export function hook<T extends object>(
  target: T,
  key: keyof T,
  descriptor: PropertyDescriptor
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, descriptor);

  return () => Object.defineProperty(target, key, original || {});
}

export function hookProp<T extends object>(
  target: T,
  key: PropKeys<T>,
  setter: (val: any) => void
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  return hook(target, key, {
    set(val) {
      original?.set?.call(this, val);
      setter.call(this, val);
    }
  });
}

export function hookMethod<T extends object>(
  target: T,
  key: MethodKeys<T>,
  hooker: typeof target[typeof key]
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  return hook(target, key, {
    value: function (...args: any[]) {
      const originalValue = original?.value;

      const result = originalValue?.apply(this, args);
      hooker.apply(this, args);

      return result;
    }
  });
}
