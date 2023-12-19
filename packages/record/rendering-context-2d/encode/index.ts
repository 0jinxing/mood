import { isPrimitive } from 'utility-types';

export function isEncodeable(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.every(v => isEncodeable(v));
  }

  if (isPrimitive(value)) return true;

  if (!value) return true;

  return false;
}

export function encodeArgs(value: unknown) {}
