import mitt, { Emitter } from 'mitt';
import { rebuild } from '@mood/snapshot';
import {
  RecordEventWithTime,
  FullSnapshotEvent,
  SourceType,
  EventType,
  IncrementalSnapshotEvent
} from '@mood/record';

import { ActionWithDelay, createTimer, Timer } from './timer';
import { createService } from './fsm';
import { applyIncremental } from '../receive';
import { ReceiveContext } from '../types';

export type PlayerConfig = {
  speed: number;
  root: HTMLElement | Element;
  styleRules: string[];
};

export type PlayerMetaData = {
  totalTime: number;
};

type EmitterEvents = {
  duration: number;
  status: 'inited' | 'playing' | 'paused' | 'ended';
  cast: RecordEventWithTime;
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

  service: ReturnType<typeof createService>;

  timer: Timer;

  emitter: Emitter<EmitterEvents>;

  constructor(private events: RecordEventWithTime[], config: Partial<PlayerConfig> = {}) {
    this.setConfig(config);

    this.timer = createTimer();
    this.service = createService({ events, speed: this.config.speed });
    this.emitter = mitt();

    this.service.start();

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

    const index = this.events.findIndex(i => i.type === EventType.FULL_SNAPSHOT);
    this.baseline = this.events[index].timestamp;

    for (const event of this.events.slice(0, index + 1)) {
      this.getCastFn(event, true)();
    }
  }

  private setConfig(config: Partial<PlayerConfig>) {
    this.config = Object.assign({}, this.config, config);
    this.timer.setSpeed(this.config.speed);
  }

  private getTimeOffset(): number {
    return this.baseline - this.events[0].timestamp;
  }

  private getDelay(event: RecordEventWithTime): number {
    const baseline = this.prev?.timestamp || this.baseline;

    if (event.type !== EventType.INCREMENTAL_SNAPSHOT) {
      return event.timestamp - baseline;
    }

    if (event.source === SourceType.MOUSE_MOVE || event.source === SourceType.TOUCH_MOVE) {
      const [, , , timestamp] = event.ps;
      return timestamp - baseline;
    }

    return event.timestamp - baseline;
  }

  private apply(event: IncrementalSnapshotEvent, sync: boolean) {
    const { $iframe, $cursor, baseline, timer } = this;

    const context: ReceiveContext = {
      $iframe,
      $cursor,
      baseline,
      timer
    };
    applyIncremental(event, context, sync);
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

  private getCastFn(event: RecordEventWithTime, sync = false) {
    let castFn: Function | undefined;

    switch (event.type) {
      case EventType.DOM_CONTENT_LOADED:
      case EventType.LOADED: {
        break;
      }

      case EventType.META: {
        castFn = () => {
          this.$iframe.width = `${event.width}px`;
          this.$iframe.height = `${event.height}px`;
        };
        break;
      }

      case EventType.FULL_SNAPSHOT: {
        castFn = () => {
          this.rebuild(event);
          const [top, left] = event.offset;
          this.$iframe.contentWindow?.scrollTo({ top, left });
        };
        break;
      }

      case EventType.INCREMENTAL_SNAPSHOT: {
        castFn = () => this.apply(event, sync);
        break;
      }
    }

    const wrappedCastFn = () => {
      this.emitter.emit('cast', event);
      castFn?.();

      this.prev = event;
    };

    return wrappedCastFn;
  }

  public getMetaData(): PlayerMetaData {
    const len = this.events.length;
    const { 0: first, [len - 1]: last } = this.events;

    return { totalTime: last.timestamp - first.timestamp };
  }

  public getCurrentTime(): number {
    return this.timer.offset + this.getTimeOffset();
  }

  public pause() {
    this.timer.clear();
    this.service.send({ type: 'pause' });
  }

  public play() {
    this.timer.clear();
    const actions: ActionWithDelay[] = [];

    for (const event of this.events) {
      if (event.timestamp <= this.prev?.timestamp || event === this.prev) continue;
      const exec = this.getCastFn(event);
      actions.push({ exec, delay: this.getDelay(event) });
    }
    this.timer.concat(actions);
    this.timer.start();
    this.service.send({ type: 'resume' });
  }

  public seek(timeOffset = 0) {}
}

export function createPlayer(events: RecordEventWithTime[], config: Partial<PlayerConfig> = {}) {
  return new Player(events, config);
}
