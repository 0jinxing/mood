import type { TEventWithTime } from 'packages/record';

export type ReplayerConfig = {
  speed: number;
  root: Element;
  loadTimeout: number;
  skipInactive: boolean;
  insertStyleRules: string[];
  triggerFocus: boolean;
};

export type ActionWithDelay = {
  doAction: () => void;
  delay: number;
};

export type ReplayerMetaData = {
  totalTime: number;
};

export enum ReplayerEmitterEvent {
  START = 'start',
  PAUSE = 'pause',
  RESUME = 'resume',
  RESIZE = 'resize',
  FINISH = 'finish',
  FULLSNAPSHOT_REBUILDED = 'fullsnapshot_rebuilded',
  LOAD_STYLESHEET_START = 'load_stylesheet_start',
  LOAD_STYLESHEET_END = 'load_stylesheet_end',
  SKIP_START = 'skip_start',
  SKIP_END = 'skip_end',
  MOUSE_INTERACTION = 'mouse_interaction',
  EVENT_CAST = 'event_cast'
}

export type ReplayerContext = {
  events: TEventWithTime[];
  timeOffset: number;
  speed: number;
};

export type ReplayerEventType =
  | 'play'
  | 'pause'
  | 'resume'
  | 'end'
  | 'replay'
  | 'fast_forward'
  | 'back_to_normal';

export type ReplayerEvent = { type: ReplayerEventType };

export type ReplayerState =
  | 'inited'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'skipping';

export type ReplayerStates = Record<
  ReplayerState,
  {
    on: {
      [key in ReplayerEventType]?: ReplayerState;
    };
  }
>;
