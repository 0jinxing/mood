import { TEventWithTime } from '@mood/record';
import { openDB, deleteDB, DBSchema } from 'idb';

export type DBStorage = {
  last: number;
  get: (
    query: number | IDBKeyRange
  ) => Promise<TEventWithTime | TEventWithTime[]>;
  add: (events: TEventWithTime[]) => void;
};

export interface MoodDBSchema extends DBSchema {
  events: {
    value: TEventWithTime;
    key: number;
    indexes: { type: number };
  };
}

const DB_NAME = 'mood_db';
const DB_VERSION = 1;

async function getDB() {
  await deleteDB(DB_NAME);
  const db = await openDB<MoodDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('events', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('type', 'type');
    }
  });

  return db;
}

let lock = false;
const queue: TEventWithTime[] = [];

let storage: DBStorage;

function getDbStorage() {
  if (storage) return storage;
  const db$ = getDB();
  storage = {
    last: 0,

    async get(query: number | IDBKeyRange) {
      const db = await db$;
      return db.getAll('events', query);
    },

    async add(events: TEventWithTime[]) {
      const db = await db$;

      queue.push(...events);
      if (lock) return;
      lock = true;
      while (queue.length) {
        const current = queue.pop();
        if (current) {
          storage.last = await db.add('events', current);
        }
      }
      lock = false;
    }
  };

  return storage;
}

export default getDbStorage;
