import type { TEventWithTime } from 'packages/record';

export type ReplayerConfig = {
  speed: number;
  root: Element;
  loadTimeout: number;
  skipInactive: boolean;
  showDebug: boolean;
  liveMode: boolean;
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
  START = 'START',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  RESIZE = 'RESIZE',
  FINISH = 'FINISH',
  FULLSNAPSHOT_REBUILDED = 'FULLSNAPSHOT_REBUILDED',
  LOAD_STYLESHEET_START = 'LOAD_STYLESHEET_START',
  LOAD_STYLESHEET_END = 'LOAD_STYLESHEET_END',
  SKIP_START = 'SKIP_START',
  SKIP_END = 'SKIP_END',
  MOUSE_INTERACTION = 'MOUSE_INTERACTION',
  EVENT_CAST = 'EVENT_CAST',
}

export type ReplayerContext = {
  events: TEventWithTime[];
  timeOffset: number;
  speed: number;
};

export enum ReplayerEventType {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  END = 'END',
  REPLAY = 'REPLAY',
  FAST_FORWARD = 'FAST_FORWARD',
  BACK_TO_NORMAL = 'BACK_TO_NORMAL',
}

export type ReplayerEvent = { type: ReplayerEventType };

export type ReplayerState = {
  value: 'inited' | 'playing' | 'paused' | 'ended' | 'skipping';
  context: ReplayerContext;
};
