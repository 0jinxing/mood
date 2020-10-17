import { nanoid } from 'nanoid';

const sessionId = nanoid(8);
export function currentSesstionId() {
  return sessionId;
}
