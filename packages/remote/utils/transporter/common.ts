import { TransporterEvent, TransporterEventHandler, TransporterEventTypes } from './types';

export abstract class Transporter {
  protected handlers = new Map<TransporterEventTypes, TransporterEventHandler[]>();

  abstract send(data: TransporterEvent): Promise<void>;

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

  abstract dispose(): void;
}
