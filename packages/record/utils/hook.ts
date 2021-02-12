export function hook<T>(
  target: T,
  key: keyof T,
  descriptor: PropertyDescriptor
) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, descriptor);

  return () => Object.defineProperty(target, key, original || {});
}

export function hookSetter<T>(
  target: T,
  key: keyof T,
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

export function hookFunc<T>(target: T, key: keyof T, func: Function) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  return hook(target, key, {
    value: function (...args: any[]) {
      const originalValue: Function | undefined = original?.value;
      const result = originalValue?.apply(this, args);
      func.apply(this, [result, args]);
      return result;
    }
  });
}
