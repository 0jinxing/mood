import { Plain } from './types';

export function isPlain(value: any): value is Plain<unknown> {
  return value && typeof value === 'object' && '$plain' in value;
}
