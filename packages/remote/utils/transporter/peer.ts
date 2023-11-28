import Peer, { DataConnection, PeerOptions } from 'peerjs';
import {
  Transporter,
  TransporterEvent,
  TransporterEventHandler,
  TransporterEventTypes
} from './types';

export type PeerTransporterOptions = {
  id: string;
  role: 'mirror' | 'embed';
} & Exclude<PeerOptions, 'id' | 'role'>;

export class PeerTransporter implements Transporter {
  peer: Peer;
  connection: DataConnection | null = null;

  ready$$: Promise<void>;

  handlers = new Map<TransporterEventTypes, TransporterEventHandler[]>();

  constructor(private options: PeerTransporterOptions) {
    this.messageHandler = this.messageHandler.bind(this);
    this.connectionHandler = this.connectionHandler.bind(this);

    this.peer = new Peer(this.uid, options);
    this.peer.on('connection', this.connectionHandler);

    this.connectionHandler(this.peer.connect(this.target));
  }

  private connectionHandler(connection: DataConnection) {
    console.log('connectionListener');

    this.connection?.off('data');
    this.connection?.close();

    this.connection = connection;
    this.connection.on('data', this.messageHandler);

    this.ready$$ = new Promise((resolve, reject) => {
      this.connection?.once('open', resolve);
      this.connection?.once('error', reject);
    });
  }

  private messageHandler(data: TransporterEvent) {
    this.handlers.get(data.event)?.forEach(h => h(data));
  }

  get uid(): string {
    return this.options.role + '-' + this.options.id;
  }

  get target(): string {
    if (this.options.role === 'embed') {
      return 'mirror-' + this.options.id;
    }
    return 'embed-' + this.options.id;
  }

  async send(data: TransporterEvent) {
    if (!this.connection) {
      console.log('no connection');
      return;
    } else if (!this.connection.open) await this.ready$$;

    this.connection?.send(data);
  }

  on<E extends TransporterEventTypes>(e: E, handler: TransporterEventHandler<E>) {
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

  off<E extends TransporterEventTypes>(e: E, handler?: TransporterEventHandler<E>): void {
    const store = this.handlers.get(e) || [];

    if (handler) {
      store.splice(store.indexOf(handler), 1);
      this.handlers.set(e, store);
    } else {
      this.handlers.set(e, []);
    }
  }

  dispose(): void {
    this.connection?.off('data');
    this.connection?.close();
    this.peer.disconnect();
  }
}

export const createPeerTransporter = (options: PeerTransporterOptions) => {
  return new PeerTransporter(options);
};
