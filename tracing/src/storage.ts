import { TEventWithTime } from '@mood/record';
import { openDB, deleteDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'mood_db';
const DB_VERSION = 1;
const EXPIRES = 0; // 0.5d

export type DBStorage = {
  last: number;
  db$: Promise<IDBPDatabase<MoodDBSchema>>;

  get: (
    query: number | IDBKeyRange
  ) => Promise<TEventWithTimeAndPk | TEventWithTimeAndPk[]>;
  add: (events: TEventWithTimeAndPk[]) => void;
  clear: () => void;
};

export type TEventWithTimeAndPk = TEventWithTime & { _pk?: number };

export interface MoodDBSchema extends DBSchema {
  events: {
    value: TEventWithTimeAndPk;
    key: number;
    indexes: {
      type: number;
      source: number;
      timestamp: number;
    };
  };
}

async function getDB() {
  await deleteDB(DB_NAME);
  const db = await openDB<MoodDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('events', {
        keyPath: '_pk',
        autoIncrement: true
      });
      store.createIndex('timestamp', 'timestamp');
      store.createIndex('type', 'type');
      store.createIndex('source', 'source');
    }
  });

  return db;
}

let storage: DBStorage;

function getDbStorage() {
  if (storage) return storage;
  const db$ = getDB();
  storage = {
    db$,
    last: 0,
    async get(query: number | IDBKeyRange) {
      const db = await db$;
      return db.getAll('events', query);
    },

    async add(events: TEventWithTime[]) {
      const db = await db$;

      const tx = db.transaction('events', 'readwrite');
      await Promise.all(events.map(e => tx.db.add('events', e)));
      await tx.done;
    },

    async clear() {
      const db = await db$;
      const range = IDBKeyRange.upperBound(Date.now() - EXPIRES);

      const tx = db.transaction('events', 'readwrite');
      const events = await tx.db.getAllFromIndex('events', 'timestamp', range);

      await Promise.all(events.map(e => tx.db.delete('events', e._pk!)));

      await tx.done;
    }
  };

  return storage;
}

export default getDbStorage;
