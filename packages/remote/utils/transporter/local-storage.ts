import {
  TransporterEventHandler,
  Transporter,
  TransporterEvent,
  TransporterEventTypes
} from './types';

export class LocalStorageTransporter implements Transporter {
  handlers = new Map<TransporterEventTypes, TransporterEventHandler[]>();

  constructor(private storageKey: string) {
    localStorage.removeItem(storageKey);

    this.storageListener = this.storageListener.bind(this);

    window.addEventListener('storage', this.storageListener);
  }

  private storageListener(e: StorageEvent) {
    if (e.key !== this.storageKey || !e.newValue) return;

    const data = JSON.parse(e.newValue) as TransporterEvent;

    this.handlers.get(data.event)?.forEach(h => h(data));
  }

  send(data: TransporterEvent): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(data));

    return Promise.resolve();
  }

  on<E extends TransporterEventTypes>(event: E, handler: TransporterEventHandler<E>): () => void {
    const store = this.handlers.get(event) || [];

    if (!store.includes(handler)) {
      store.push(handler);
    }

    this.handlers.set(event, store);

    return () => {
      store.splice(store.indexOf(handler), 1);
      this.handlers.set(event, store);
    };
  }

  off<E extends TransporterEventTypes>(
    event: E,
    handler?: TransporterEventHandler<E> | undefined
  ): void {
    const store = this.handlers.get(event) || [];

    if (handler) {
      store.splice(store.indexOf(handler), 1);
      this.handlers.set(event, store);
    } else {
      this.handlers.set(event, []);
    }
  }

  dispose(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const createLocalStorageTransporter = (storageKey = 'transporter_message') => {
  return new LocalStorageTransporter(storageKey);
};
