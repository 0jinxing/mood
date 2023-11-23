import { RecordEventWithTime } from '@mood/record';

export class EventBuffer {
  events: RecordEventWithTime[] = [];

  add(event: RecordEventWithTime) {
    if (event.timestamp > this.events[this.events.length - 1]?.timestamp) {
      this.events.push(event);
    } else {
      const index = this.events.findIndex(e => e.timestamp > event.timestamp);
      this.events.splice(index, 0, event);
    }
  }
}
