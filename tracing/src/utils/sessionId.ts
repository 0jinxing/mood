import { nanoid } from 'nanoid';

const SESSION_KEY = '@mood/sessionId';

export function currentSesstionId() {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = nanoid(8);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}
