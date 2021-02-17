import { Addition } from '../types';

const cache = new WeakMap();

export function setAddition<T extends Addition>(target: object, value: T) {
  cache.set(target, value);
}

export function getAddition<T extends Addition>(target: object): T | undefined {
  return cache.get(target);
}
