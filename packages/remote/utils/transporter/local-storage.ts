import { Transporter } from './common';
import { TransporterEvent } from './types';

export class LocalStorageTransporter extends Transporter {
  constructor(private storageKey: string) {
    super();
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

  dispose(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const createLocalStorageTransporter = (storageKey = 'transporter_message') => {
  return new LocalStorageTransporter(storageKey);
};
