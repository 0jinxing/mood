import Peer, { DataConnection, PeerOptions } from 'peerjs';
import { Messager, MessagerEvent, MessagerEventHandler, MessagerEventTypes } from './types';

export type PeerMessagerOptions = {
  id: string;
  role: 'client' | 'embed';
} & Exclude<PeerOptions, 'id' | 'role'>;

export class PeerMessager implements Messager {
  peer: Peer;
  connection: DataConnection;

  ready$$: Promise<void>;

  constructor(private options: PeerMessagerOptions) {
    this.peer = new Peer(this.uid, options);
    this.connection = this.peer.connect(this.target);

    this.ready$$ = new Promise((resolve, reject) => {
      this.connection.once('open', resolve);
      this.connection.once('error', reject);
    });
  }

  get uid(): string {
    return this.options.role + '-' + this.options.id;
  }

  get target(): string {
    if (this.options.role === 'embed') {
      return 'client-' + this.options.id;
    }
    return 'embed-' + this.options.id;
  }

  async send(data: MessagerEvent) {
    if (!this.connection.open) await this.ready$$;

    this.connection.send(data);
  }

  handlers = new Map<MessagerEventTypes, MessagerEventHandler[]>();

  on<E extends MessagerEventTypes>(e: E, handler: MessagerEventHandler<E>) {
    const store = this.handlers.get(e) || [];

    if (!store.includes(handler)) {
      store.push(handler);
    }

    this.handlers.set(e, store);

    return () => {
      store.splice(store.indexOf(handler), 1);
      this.handlers.set(e, store);
    };
  }

  off<E extends MessagerEventTypes>(e: E, handler?: MessagerEventHandler<E>): void {
    const store = this.handlers.get(e) || [];

    if (handler) {
      store.splice(store.indexOf(handler), 1);
      this.handlers.set(e, store);
    } else {
      this.handlers.set(e, []);
    }
  }

  dispose(): void {
    this.connection.close();
    this.peer.disconnect();
  }
}

export const createPeerMessager = (options: PeerMessagerOptions) => {
  return new PeerMessager(options);
};
