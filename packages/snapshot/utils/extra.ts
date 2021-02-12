const extra = new WeakMap();

export function setExtraData(target: object, value: any) {
  extra.set(target, value);
}

export function getExtraData<T>(target: object): T | undefined {
  return extra.get(target);
}
