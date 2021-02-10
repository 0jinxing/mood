import { Plain } from './types';

export function isPlain(value: any): value is Plain<unknown> {
  return '$plain' in value;
}
