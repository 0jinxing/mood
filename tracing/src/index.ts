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
      if (db.last % 16 === 0) {
        console.log(db.last, await db.get(db.last));
      }
      // if (events.length > 20) {
      //   fetch('http://127.0.0.1:3000/api/event', {
      //     mode: 'cors',
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       uid: 'imRV3EI3',
      //       data: deflate(JSON.stringify(events), { to: 'string' })
      //     })
      //   });
      //   events = [];
      // }
    }
  });
}

export default mood;
