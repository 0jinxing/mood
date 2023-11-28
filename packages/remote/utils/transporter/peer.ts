import Peer, { DataConnection, PeerOptions } from 'peerjs';
import { TransporterEvent, TransporterEventHandler, TransporterEventTypes } from './types';
import { Transporter } from './common';

export type PeerTransporterOptions = {
  id: string;
  role: 'mirror' | 'embed';
} & Exclude<PeerOptions, 'id' | 'role'>;

export class PeerTransporter extends Transporter {
  peer: Peer;
  connection: DataConnection | null = null;

  ready$$: Promise<void>;

  constructor(private options: PeerTransporterOptions) {
    super();
    this.messageHandler = this.messageHandler.bind(this);
    this.setup = this.setup.bind(this);

    this.peer = new Peer(this.uid, options);
    this.peer.on('connection', this.setup);

    this.setup(this.peer.connect(this.target));
  }

  private setup(connection: DataConnection) {
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
    if (!this.connection?.open) {
      await this.ready$$;
    }
    this.connection?.send(data);
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
