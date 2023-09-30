import mitt, { Emitter } from 'mitt';
import { rebuild } from '@mood/snapshot';
import {
  RecordEventWithTime,
  FullSnapshotEvent,
  SourceTypes,
  EventTypes,
  IncrementalSnapshotEvent
} from '@mood/record';

import { createScheduler, Scheduler } from './scheduler';
import { applyIncremental } from '../actors';
import { ReceiveContext } from '../types';

export type PlayerConfig = {
  speed: number;
  root: HTMLElement | Element;
  styleRules: string[];
  customApplyIncremental?: typeof applyIncremental;
};

export type PlayerMetaData = {
  totalTime: number;
};

type EmitterEvents = {
  duration: number;
  status: 'inited' | 'playing' | 'paused' | 'ended';
  picked: RecordEventWithTime;
};

const defaultConfig: PlayerConfig = {
  speed: 1,
  root: document.body,
  styleRules: []
};

export class Player {
  private $iframe: HTMLIFrameElement;

  private $container: HTMLElement;

  private $cursor: HTMLElement;

  private baseline = 0;

  private prev: RecordEventWithTime;

  private config: PlayerConfig = defaultConfig;

  scheduler: Scheduler;

  emitter: Emitter<EmitterEvents>;

  constructor(private events: RecordEventWithTime[], config: Partial<PlayerConfig> = {}) {
    this.scheduler = createScheduler();

    this.setConfig(config);
    this.emitter = mitt();

    this.setup();
  }

  private setup() {
    this.$container = document.createElement('div');
    this.$container.classList.add('mood-container');

    this.$cursor = document.createElement('div');
    this.$cursor.classList.add('mood-cursor');

    this.$iframe = document.createElement('iframe');
    this.$iframe.setAttribute('sandbox', 'allow-same-origin');
    this.$iframe.setAttribute('scrolling', 'no');
    this.$iframe.setAttribute('style', 'pointer-events: none');

    this.$container.appendChild(this.$iframe);
    this.$container.appendChild(this.$cursor);

    this.config.root.appendChild(this.$container);

    const index = this.events.findIndex(i => i.type === EventTypes.FULL_SNAPSHOT);
    this.baseline = this.events[index].timestamp;

    for (const event of this.events.slice(0, index + 1)) {
      const handler = this.picked(event, true);
      handler();
    }

    this.emitter.emit('status', 'inited');
  }

  private setConfig(config: Partial<PlayerConfig>) {
    this.config = Object.assign({}, this.config, config);
    this.scheduler.speed = this.config.speed;
  }

  private getDelay(event: RecordEventWithTime, baseline: number): number {
    if (event.type !== EventTypes.INCREMENTAL_SNAPSHOT) {
      return event.timestamp - baseline;
    }

    if (event.source === SourceTypes.MOUSE_MOVE || event.source === SourceTypes.TOUCH_MOVE) {
      const [, , , timestamp] = event.ps;
      return timestamp - baseline;
    }

    return event.timestamp - baseline;
  }

  private apply(event: IncrementalSnapshotEvent, sync: boolean) {
    const { $iframe, $cursor, baseline, scheduler } = this;

    const context: ReceiveContext = {
      $iframe,
      $cursor,
      baseline,
      scheduler
    };
    applyIncremental(event, context, sync);
    this.config.customApplyIncremental?.(event, context, sync);
  }

  private rebuild(event: RecordEventWithTime & FullSnapshotEvent) {
    const contentDocument = this.$iframe.contentDocument!;

    rebuild(event.adds, contentDocument);

    const $style = contentDocument.createElement('style');
    const { documentElement, head } = contentDocument;
    documentElement.insertBefore($style, head);

    const stylesRules = ['noscript { display: none !important; }'].concat(this.config.styleRules);

    for (let ind = 0; ind < stylesRules.length && $style.sheet; ind++) {
      $style.sheet.insertRule(stylesRules[ind], ind);
    }
  }

  private picked(event: RecordEventWithTime, sync = false) {
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

      this.emitter.emit('picked', event);
      this.emitter.emit('duration', this.metaData.totalTime - this.currentTime);

      const index = this.events.indexOf(event);

      if (index !== this.events.length - 1) return;

      this.emitter.emit('status', 'ended');
    };

    return wrapped;
  }

  get metaData(): PlayerMetaData {
    const end = this.events.slice(-1)[0];
    const totalTime = Math.max(end.timestamp - this.baseline, 0);

    return { totalTime };
  }

  get currentTime() {
    if (!this.prev) return 0;
    return this.prev?.timestamp - this.baseline;
  }

  public pause() {
    this.scheduler.clear();
    this.emitter.emit('status', 'paused');
  }

  public play() {
    this.scheduler.clear();

    for (const event of this.events) {
      if (event.timestamp <= this.prev?.timestamp || event === this.prev) continue;

      const baseline = this.prev?.timestamp || this.baseline;
      this.scheduler.push({ exec: this.picked(event), delay: this.getDelay(event, baseline) });
    }
    this.scheduler.start();
    this.emitter.emit('status', 'playing');
  }

  public seek(offset = 0) {
    const events = this.events;
    this.scheduler.clear();

    const slice = events.findIndex(
      event => event.type === EventTypes.FULL_SNAPSHOT && event.timestamp < this.baseline + offset
    );

    const baseline = this.baseline + offset;

    for (let event of events.slice(slice)) {
      const delay = this.getDelay(event, baseline);
      const exec = this.picked(event);

      if (delay <= 0) {
        exec();
        continue;
      }
      this.scheduler.push({ exec, delay });
    }
  }
}

export function createPlayer(events: RecordEventWithTime[], config: Partial<PlayerConfig> = {}) {
  return new Player(events, config);
}
