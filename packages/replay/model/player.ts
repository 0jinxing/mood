import { Mirror, rebuild } from '@mood/snapshot';
import { RecordEventWithTime, SnapshotEvent, ET, DeltaEvent } from '@mood/record';

import { createScheduler, Scheduler } from './scheduler';
import { handleEmit } from '../handle';
import { EmitHandlerContext } from '../types';
import { lastIndexOf } from '@mood/utils';

export type PlayerConfig = {
  container: HTMLElement;
  speed: number;
  mirror: Mirror;

  iframe?: HTMLIFrameElement;
  styleRules?: string[];
  live?: boolean;
  interact?: boolean;

  onLoaded?: (meta: { totalTime: number }) => void;
  onPlay?: () => void;
  onProgress?: (percent: number) => void;
  onPause?: () => void;
  onSeeked?: (time: number) => void;
  onEnded?: () => void;
};

export class Player {
  iframe: HTMLIFrameElement;

  private container: HTMLElement;

  private cursor: HTMLElement;

  private prev: RecordEventWithTime;

  private config: PlayerConfig;

  scheduler: Scheduler;

  constructor(
    private events: RecordEventWithTime[],
    config: PlayerConfig
  ) {
    this.scheduler = createScheduler();

    this.setConfig(config);

    this.setup();
  }

  private setup() {
    this.container = this.config.container;
    this.container.classList.add('mood-container');

    this.cursor = document.createElement('div');
    this.cursor.classList.add('mood-cursor');

    this.iframe = this.config.iframe || document.createElement('iframe');
    this.iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    this.iframe.setAttribute('scrolling', this.config.interact ? 'auto' : 'no');
    this.iframe.style.pointerEvents = this.config.interact ? 'auto' : 'none';

    this.container.appendChild(this.iframe);
    this.container.appendChild(this.cursor);

    // apply meta event
    for (const event of this.events.slice(
      0,
      this.events.findIndex(i => i.type === ET.SNAPSHOT) + 1
    )) {
      const handler = this.pickHandler(event, true);
      handler();
    }
    this.config.onLoaded?.(this.metaData);
  }

  private setConfig(config: Partial<PlayerConfig>) {
    this.config = Object.assign({}, this.config, config);
    this.scheduler.speed = this.config.speed;
  }

  private getDelay(event: RecordEventWithTime, baseline: number): number {
    return event.timestamp - baseline;
  }

  private apply(event: DeltaEvent, sync: boolean) {
    const { iframe: iframe, cursor: cursor, baseline, scheduler } = this;

    const context: EmitHandlerContext = {
      $iframe: iframe,
      $cursor: cursor,
      baseline,
      scheduler,
      mirror: this.config.mirror
    };
    handleEmit(event, context, sync);
  }

  private rebuild(event: RecordEventWithTime & SnapshotEvent) {
    const contentDocument = this.iframe.contentDocument!;

    rebuild(event.adds, contentDocument, this.config.mirror);

    const $style = contentDocument.createElement('style');
    const { documentElement, head } = contentDocument;
    documentElement.insertBefore($style, head);

    const styleRules = ['noscript { display: none !important; }'].concat(
      this.config.styleRules || []
    );

    styleRules.forEach((rule, index) => $style.sheet?.insertRule(rule, index));
  }

  private pickHandler(event: RecordEventWithTime, sync = false) {
    const handler = () => {
      switch (event.type) {
        case ET.DOM_CONTENT_LOADED:
        case ET.LOADED:
          break;

        case ET.META: {
          this.iframe.width = `${event.width}px`;
          this.iframe.height = `${event.height}px`;
          break;
        }

        case ET.SNAPSHOT: {
          this.rebuild(event);
          const [top, left] = event.offset;
          const { width, height } = event;
          this.iframe.width = `${width}px`;
          this.iframe.height = `${height}px`;

          this.iframe.contentWindow?.scrollTo({ top, left });
          break;
        }

        case ET.DELTA: {
          this.apply(event, sync);
          break;
        }
      }
    };

    const wrapped = () => {
      handler();
      this.prev = event;
      this.config.onProgress?.(this.currentTime / this.metaData.totalTime);
      const index = this.events.indexOf(event);

      if (index !== this.events.length - 1) return;
    };

    return wrapped;
  }

  get baseline(): number {
    return this.events[this.events.findIndex(i => i.type === ET.SNAPSHOT)]?.timestamp || 0;
  }

  get metaData() {
    const end = this.events.slice(-1)[0];
    const totalTime = Math.max(end.timestamp - this.baseline, 0);

    return { totalTime };
  }

  get currentTime() {
    if (!this.prev) return 0;
    return this.prev?.timestamp - this.baseline;
  }

  get playing() {
    return Boolean(this.scheduler.raf);
  }

  public pause() {
    this.scheduler.clear();
    this.config.onPause?.();
  }

  public play() {
    this.scheduler.clear();

    for (const event of this.events) {
      if (event.timestamp < this.prev?.timestamp || event === this.prev) continue;

      const baseline = this.prev?.timestamp || this.baseline;
      this.scheduler.push({ exec: this.pickHandler(event), delay: this.getDelay(event, baseline) });
    }
    this.scheduler.start();
    this.config.onPlay?.();
  }

  public seek(offset = 0) {
    const events = this.events;
    this.scheduler.clear();

    const lastIndex = lastIndexOf(
      events,
      event => event.type === ET.SNAPSHOT && event.timestamp < this.baseline + offset
    );

    const slice = lastIndex - 1;
    const baseline = this.baseline + offset;

    for (let event of events.slice(slice)) {
      const delay = this.getDelay(event, baseline);
      const exec = this.pickHandler(event);

      if (delay <= 0) {
        exec();
        continue;
      }
      this.scheduler.push({ exec, delay });
    }

    this.config?.onSeeked?.(offset);
  }

  public pushEvent(event: RecordEventWithTime) {
    // TODO: handle event
    this.events.push(event);
    this.scheduler.push({
      exec: this.pickHandler(event),
      delay: this.getDelay(event, this.prev?.timestamp || this.baseline)
    });
  }

  public enableInteract() {
    this.config.interact = true;
    this.iframe.setAttribute('scrolling', 'auto');
    this.iframe.style.pointerEvents = 'auto';
  }

  public disableInteract() {
    this.config.interact = false;
    this.iframe.setAttribute('scrolling', 'no');
    this.iframe.style.pointerEvents = 'none';
  }
}

export function createPlayer(events: RecordEventWithTime[], config: PlayerConfig) {
  return new Player(events, config);
}
