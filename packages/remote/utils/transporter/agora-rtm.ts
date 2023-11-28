import AgoraRTM, { RtmClient, RtmMessage } from 'agora-rtm-sdk';
import {
  Transporter,
  TransporterEvent,
  TransporterEventHandler,
  TransporterEventTypes
} from './types';

type AgoraRTMConfig = Required<Parameters<typeof AgoraRTM.createInstance>>[1];

export class AgoraRTMTransporter implements Transporter {
  private client: RtmClient;

  private ready$$: Promise<void>;

  handlers = new Map<TransporterEventTypes, TransporterEventHandler[]>();

  constructor(
    appId: string,
    token: string,
    private id: string,
    private role: 'mirror' | 'embed',
    private config: AgoraRTMConfig = {}
  ) {
    this.messageHandler = this.messageHandler.bind(this);

    this.client = AgoraRTM.createInstance(appId, config);
    this.client.on('MessageFromPeer', this.messageHandler);
    this.ready$$ = this.client.login({ uid: this.uid, token });
  }

  messageHandler(message: RtmMessage) {
    const text =
      message.messageType === 'TEXT' ? message.text : new TextDecoder().decode(message.rawMessage);
    const data: TransporterEvent = JSON.parse(text);

    this.handlers.get(data.event)?.forEach(h => h(data));
  }

  get uid(): string {
    return this.role + '-' + this.id;
  }

  get target(): string {
    const prefix = this.role === 'embed' ? 'mirror' : 'embed';
    return prefix + '-' + this.id;
  }

  async send(data: TransporterEvent) {
    await this.ready$$;
    await this.client.sendMessageToPeer({ text: JSON.stringify(data) }, this.target);
  }

  on<E extends TransporterEventTypes>(e: E, handler: TransporterEventHandler<E>): () => unknown {
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

  off<E extends TransporterEventTypes>(e: E, handler?: TransporterEventHandler<E> | undefined) {
    const store = this.handlers.get(e) || [];

    if (handler) {
      store.splice(store.indexOf(handler), 1);
      this.handlers.set(e, store);
    } else {
      this.handlers.set(e, []);
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
