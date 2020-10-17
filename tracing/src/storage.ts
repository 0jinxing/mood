import { TEventWithTime } from '@mood/record';
import { openDB, deleteDB, DBSchema } from 'idb';
import { TEventWithTimeAndSession } from './types';
import { currentSesstionId } from './utils/sessionId';

const DB_NAME = 'mood_db@@event';
const DB_VERSION = 1;

export interface MoodDBSchema extends DBSchema {
  events: {
    value: TEventWithTimeAndSession;
    key: number;
    indexes: {
      type: number;
      source: number;
      timestamp: number;
      session: string;
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

export type StorageConfig = {
  expires: number;
};
const defaultConfig = { expires: 1000 * 60 * 60 * 12 };

function getDbStorage(partialConfig?: Partial<StorageConfig>) {
  const config = Object.assign({}, defaultConfig, partialConfig);

  const db$ = getDB();
  const storage = {
    db$,
    last: 0,

    async add(events: TEventWithTime[]) {
      const db = await db$;

      const tx = db.transaction('events', 'readwrite');
      const result = await Promise.all(
        events.map(e =>
          tx.db.add('events', { ...e, session: currentSesstionId() })
        )
      );
      await tx.done;
      return result;
    },

    async clear() {
      const db = await db$;
      const range = IDBKeyRange.upperBound(Date.now() - config.expires);

      const tx = db.transaction('events', 'readwrite');
      const events = await tx.db.getAllFromIndex('events', 'timestamp', range);

      await Promise.all(events.map(e => tx.db.delete('events', e._pk!)));

      await tx.done;
    }
  };

  return storage;
}

export default getDbStorage;
