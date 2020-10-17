import record from '@mood/record';
import { currentSesstionId } from './utils/sessionId';
import getStorage from './storage';

async function mood() {
  const sessionId = currentSesstionId();
  console.log(sessionId);
  const db = getStorage();

  record({
    emit: async event => {
      if (typeof event === 'string') return;
      db.add([{ ...event, timestamp: Date.now() }]);
    }
  });
}

export default mood;
