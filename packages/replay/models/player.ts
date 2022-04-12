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
  root: HTMLElement;
  styleRules: string[];
};

export type PlayerMetaData = {
  totalTime: number;
};

const defaultConfig: PlayerConfig = {
  speed: 1,
  root: document.body,
  styleRules: []
};

export class Player {
  private $iframe: HTMLIFrameElement;

  private $wrapper: HTMLElement;

  private $cursor: HTMLElement;

  private baseline = 0;

  private lastEvent: RecordEventWithTime;

  private service: ReturnType<typeof createService>;

  private timer: Timer;

  private config: PlayerConfig = defaultConfig;

  constructor(
    private events: RecordEventWithTime[],
    config: Partial<PlayerConfig> = {}
  ) {
    this.timer = createTimer();

    this.setConfig(config);

    this.setupDOM();

    this.service = createService({
      events,
      timeOffset: 0,
      speed: this.config.speed
    });
    this.service.start();
  }

  private setupDOM() {
    this.$wrapper = document.createElement('div');
    this.$wrapper.classList.add('__wrapper');

    this.$cursor = document.createElement('div');
    this.$cursor.classList.add('__cursor');

    this.$iframe = document.createElement('iframe');
    this.$iframe.setAttribute('sandbox', 'allow-same-origin');
    this.$iframe.setAttribute('scrolling', 'no');
    this.$iframe.setAttribute('style', 'pointer-events: none');

    this.$wrapper.appendChild(this.$iframe);
    this.$wrapper.appendChild(this.$cursor);

    this.config.root.appendChild(this.$wrapper);
  }

  private setConfig(config: Partial<PlayerConfig>) {
    this.config = Object.assign({}, this.config, config);
    this.timer.setSpeed(this.config.speed);
  }

  private getTimeOffset(): number {
    return this.baseline - this.events[0].timestamp;
  }

  private getDelay(event: RecordEventWithTime): number {
    if (event.type !== EventType.INCREMENTAL_SNAPSHOT) {
      return event.timestamp - this.baseline;
    }

    if (
      event.source === SourceType.MOUSE_MOVE ||
      event.source === SourceType.TOUCH_MOVE
    ) {
      const [, , , timestamp] = event.ps;
      return timestamp - this.baseline;
    }

    return event.timestamp - this.baseline;
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

    const stylesRules = ['noscript { display: none !important; }'].concat(
      this.config.styleRules
    );

    for (let ind = 0; ind < stylesRules.length && $style.sheet; ind++) {
      $style.sheet.insertRule(stylesRules[ind], ind);
    }
  }

  private getCastFn(event: RecordEventWithTime, isSync = false) {
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
        castFn = () => {
          this.apply(event, isSync);
        };
        break;
      }
    }

    const wrappedCastFn = () => {
      castFn?.();

      this.lastEvent = event;
    };

    return wrappedCastFn;
  }

  public getMetaData(): PlayerMetaData {
    const len = this.events.length;
    const { 0: first, [len - 1]: last } = this.events;

    return { totalTime: last.timestamp - first.timestamp };
  }

  public getCurrentTime(): number {
    return this.timer.timeOffset + this.getTimeOffset();
  }

  public pause() {
    this.timer.clear();
    this.service.send({ type: 'pause' });
  }

  public play(timeOffset = 0) {
    this.timer.clear();
    this.baseline = this.events[0].timestamp + timeOffset;
    const actions: ActionWithDelay[] = [];
    for (const event of this.events) {
      const sync = event.timestamp < this.baseline;
      const execAction = this.getCastFn(event, sync);

      if (sync) execAction();
      else {
        actions.push({ execAction, delay: this.getDelay(event) });
      }
    }
    this.timer.addActions(actions);
    this.timer.start();
    this.service.send({ type: 'play' });
  }

  public resume(timeOffset = 0) {
    this.timer.clear();
    this.baseline = this.events[0].timestamp + timeOffset;
    const actions: ActionWithDelay[] = [];

    for (const event of this.events) {
      if (
        event.timestamp <= this.lastEvent.timestamp ||
        event === this.lastEvent
      ) {
        continue;
      }
      const castFn = this.getCastFn(event);
      actions.push({
        execAction: castFn,
        delay: this.getDelay(event)
      });
    }
    this.timer.addActions(actions);
    this.timer.start();
    this.service.send({ type: 'resume' });
  }
}

export function createPlayer(
  events: RecordEventWithTime[],
  config: Partial<PlayerConfig> = {}
) {
  return new Player(events, config);
}
