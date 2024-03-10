import AgoraRTM, { RtmClient, RtmRawMessage } from 'agora-rtm-sdk';
import { TransporterEvent } from './types';
import { Transporter } from './common';
import { compressSync, decompressSync } from 'fflate';

const MessageLimit = 32 * 1000;
const MessageHead = 8;

type AgoraRTMConfig = Required<Parameters<typeof AgoraRTM.createInstance>>[1];

export function splitByLimit(seq: number, buf: Uint8Array, limit: number) {
  const length = Math.ceil(buf.byteLength / limit);
  const result: Uint8Array[] = new Array(length);

  for (let index = 0; index < length; index++) {
    const head = new Uint8Array(MessageHead);
    const view = new DataView(head.buffer);
    result[index] = buf.slice(index * limit, (index + 1) * limit);
    view.setUint32(0, seq);
    view.setUint16(4, index);
    view.setUint16(6, length);
    result[index] = new Uint8Array([...head, ...result[index]]);
  }
  return result;
}

export class AgoraRTMTransporter extends Transporter {
  private client: RtmClient;

  private ready$$: Promise<void>;

  private store = new Map<number, Uint8Array[]>();

  constructor(
    appId: string,
    token: string,
    private id: string,
    private role: 'mirror' | 'embed',
    config: AgoraRTMConfig = {}
  ) {
    super();
    this.messageHandler = this.messageHandler.bind(this);

    this.client = AgoraRTM.createInstance(appId, config);
    this.client.on('MessageFromPeer', this.messageHandler);
    this.ready$$ = this.client.login({ uid: this.uid, token });
  }

  messageHandler({ rawMessage }: RtmRawMessage) {
    const buf = new Uint8Array(rawMessage);
    const view = new DataView(buf.buffer);
    const seq = view.getUint32(0);
    const index = view.getUint16(4);
    const length = view.getUint16(6);

    const received = this.store.get(seq) || Array.from({ length });
    received[index] = new Uint8Array(buf.slice(MessageHead));
    this.store.set(seq, received);

    if (received.length === length && received.every(Boolean)) {
      this.store.delete(seq);

      const byteLength = received.reduce((acc, p) => acc + p.byteLength, 0);
      const result = new Uint8Array(byteLength);
      for (let i = 0, offset = 0; i < received.length; i++) {
        result.set(received[i], offset);
        offset += received[i].byteLength;
      }
      const text = new TextDecoder().decode(decompressSync(result));
      const msg = JSON.parse(text);
      this.handlers.get(msg.event)?.forEach(h => h(msg));
    }
  }

  get uid(): string {
    return this.role + '-' + this.id;
  }

  get target(): string {
    const prefix = this.role === 'embed' ? 'mirror' : 'embed';
    return prefix + '-' + this.id;
  }

  private seq = 0;
  async send(data: TransporterEvent) {
    await this.ready$$;
    const buf = compressSync(new TextEncoder().encode(JSON.stringify(data)));
    const chunks = splitByLimit(this.seq, buf, MessageLimit - MessageHead);
    for (const rawMessage of chunks) {
      await this.client.sendMessageToPeer({ rawMessage }, this.target);
    }
  }

  dispose() {
    this.client.off('MessageFromPeer', this.messageHandler);
    this.client.logout();
  }
}

export function createAgoraRTMTransporter(
  ...args: ConstructorParameters<typeof AgoraRTMTransporter>
) {
  return new AgoraRTMTransporter(...args);
}
