import { deflate } from 'pako';
import record, { TEvent } from '@mood/record';

let events: TEvent[] = [];

function mood() {
  record({
    emit: async event => {
      if (typeof event === 'string') return;

      events.push(event);
      if (events.length > 20) {
        fetch('http://127.0.0.1:3000/api/event', {
          mode: 'cors',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: 'imRV3EI3',
            data: deflate(JSON.stringify(events), { to: 'string' })
          })
        });
        events = [];
      }
    }
  });
}

export default mood;
