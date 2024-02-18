import AgoraRTM, { RtmClient, RtmMessage } from 'agora-rtm-sdk';
import { TransporterEvent } from './types';
import { Transporter } from './common';

const AgoraMessageLimit = 32 * 1000;
const AgoraMessageHead = 10;
const AgoraMessageLimitWithHead = AgoraMessageLimit - AgoraMessageHead;
const AgoraMessageSeparator = '@';

type AgoraRTMConfig = Required<Parameters<typeof AgoraRTM.createInstance>>[1];

function byteChunk(text: string, limit: number = AgoraMessageLimitWithHead) {
  let buffer = Buffer.from(text);
  const result: string[] = [];
  while (buffer.length) {
    let i = buffer.lastIndexOf(32, limit + 1);
    // If no space found, try forward search
    if (i < 0) i = buffer.indexOf(32, limit);
    // If there's no space at all, take the whole string
    if (i < 0) i = buffer.length;
    // This is a safe cut-off point; never half-way a multi-byte
    result.push(buffer.slice(0, i).toString());
    buffer = buffer.slice(i + 1); // Skip space (if any)
  }
  return result;
}

type Part = { order: number; data: string };

export class AgoraRTMTransporter extends Transporter {
  private client: RtmClient;

  private ready$$: Promise<void>;

  private parts: Record<string, Part[]> = {};

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
    this.ready$$ = this.client.login({ uid: this.uid, token }).catch(e => {
      console.log(appId, this.uid, token);
      console.log(e);
    });
  }

  messageHandler(message: RtmMessage) {
    const text =
      message.messageType === 'TEXT' ? message.text : new TextDecoder().decode(message.rawMessage);
    console.log('rec', text);

    if (!text) return;

    try {
      const message = JSON.parse(text);
      this.handlers.get(message.event)?.forEach(h => h(message));
    } catch {
      const [seq, sort, ...content] = text.split(AgoraMessageSeparator);
      this.parts[seq] = this.parts[seq] || [];
      this.parts[seq].push({ order: +sort, data: content.join(AgoraMessageSeparator) });

      const result = this.parts[seq]
        .sort((a, b) => a.order - b.order)
        .map(p => p.data)
        .join('');
      try {
        const message = JSON.parse(result);
        this.handlers.get(message.event)?.forEach(h => h(message));
        delete this.parts[seq];
      } catch {
        // ignore
      }
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
    const text = JSON.stringify(data);
    const parts = byteChunk(text);
    if (parts.length > 1) {
      await Promise.all(
        parts.map((p, index) =>
          this.client.sendMessageToPeer(
            { text: this.seq + AgoraMessageSeparator + index + AgoraMessageSeparator + p },
            this.target
          )
        )
      );
      this.seq++;
    } else {
      console.log('send', text);
      await this.client.sendMessageToPeer({ text }, this.target);
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
