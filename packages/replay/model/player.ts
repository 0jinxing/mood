import { Mirror, rebuild } from '@mood/snapshot';
import {
  RecordEventWithTime,
  FullSnapshotEvent,
  EventTypes,
  IncrementalSnapshotEvent
} from '@mood/record';

import { createScheduler, Scheduler } from './scheduler';
import { handleEmit } from '../handle';
import { EmitHandlerContext } from '../types';
import { lastIndexOf } from '@mood/utils';

export type PlayerConfig = {
  speed: number;
  root: HTMLElement | Element;
  iframe?: HTMLIFrameElement;
  styleRules?: string[];
  live?: boolean;

  onLoaded?: (meta: { totalTime: number }) => void;
  onPlay?: () => void;
  onProgress?: (percent: number) => void;
  onPause?: () => void;
  onSeeked?: (time: number) => void;
  onEnded?: () => void;
};

const defaultConfig: PlayerConfig = { speed: 1, root: document.body };

export class Player {
  private $iframe: HTMLIFrameElement;

  private $container: HTMLElement;

  private $cursor: HTMLElement;

  private prev: RecordEventWithTime;

  private config: PlayerConfig = { ...defaultConfig };

  private mirror = new Mirror();

  scheduler: Scheduler;

  constructor(
    private events: RecordEventWithTime[],
    config: Partial<PlayerConfig> = {}
  ) {
    this.scheduler = createScheduler();

    this.setConfig(config);

    this.setup();
  }

  private setup() {
    this.$container = document.createElement('div');
    this.$container.classList.add('mood-container');

    this.$cursor = document.createElement('div');
    this.$cursor.classList.add('mood-cursor');

    this.$iframe = this.config.iframe || document.createElement('iframe');
    this.$iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
    this.$iframe.setAttribute('scrolling', 'no');
    this.$iframe.style.pointerEvents = 'none';

    this.$container.appendChild(this.$iframe);
    this.$container.appendChild(this.$cursor);

    this.config.root.appendChild(this.$container);

    // apply meta event
    for (const event of this.events.slice(
      0,
      this.events.findIndex(i => i.type === EventTypes.FULL_SNAPSHOT) + 1
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

  private apply(event: IncrementalSnapshotEvent, sync: boolean) {
    const { $iframe, $cursor, baseline, scheduler, mirror } = this;

    const context: EmitHandlerContext = { $iframe, $cursor, baseline, scheduler, mirror };
    handleEmit(event, context, sync);
  }

  private rebuild(event: RecordEventWithTime & FullSnapshotEvent) {
    const contentDocument = this.$iframe.contentDocument!;

    rebuild(event.adds, contentDocument, this.mirror);

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
        case EventTypes.DOM_CONTENT_LOADED:
        case EventTypes.LOADED:
          break;

        case EventTypes.META: {
          this.$iframe.width = `${event.width}px`;
          this.$iframe.height = `${event.height}px`;
          break;
        }

        case EventTypes.FULL_SNAPSHOT: {
          this.rebuild(event);
          const [top, left] = event.offset;
          this.$iframe.contentWindow?.scrollTo({ top, left });
          break;
        }

        case EventTypes.INCREMENTAL_SNAPSHOT: {
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
    return (
      this.events[this.events.findIndex(i => i.type === EventTypes.FULL_SNAPSHOT)]?.timestamp || 0
    );
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
      event => event.type === EventTypes.FULL_SNAPSHOT && event.timestamp < this.baseline + offset
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
}

export function createPlayer(events: RecordEventWithTime[], config: Partial<PlayerConfig> = {}) {
  return new Player(events, config);
}
