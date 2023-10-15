import Peer, { DataConnection, PeerOptions } from 'peerjs';
import { Messager } from './types';

export type PeerMessagerOptions = {
  id: string;
  role: 'client' | 'embed';
} & Exclude<PeerOptions, 'id' | 'role'>;

export class PeerMessager implements Messager {
  peer: Peer;
  connection: DataConnection;

  constructor(private options: PeerMessagerOptions) {
    this.peer = new Peer(this.uid, options);
    this.connection = this.peer.connect(this.targetUid);
  }

  get uid(): string {
    return this.options.role + '-' + this.options.id;
  }

  get targetUid(): string {
    if (this.options.role === 'embed') {
      return 'client-' + this.options.id;
    }
    return 'embed-' + this.options.id;
  }

  async send(data: unknown) {
    if (!this.connection.open) {
      await new Promise<0>((resolve, reject) => {
        this.connection.once('open', () => resolve(0));
        this.connection.once('error', reject);
      });
    }

    this.connection.send(data);
  }

  on(event: string, handler: (...args: unknown[]) => void): () => unknown {
    throw new Error('Method not implemented.');
  }

  off(event: string, handler?: ((...args: unknown[]) => void) | undefined): void {
    throw new Error('Method not implemented.');
  }
}

export const createPeerMessager = (options: PeerMessagerOptions) => {
  return new PeerMessager(options);
};
