import type { TEventWithTime } from 'packages/record';

export type PlayerConfig = {
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

export type PlayerMetaData = {
  totalTime: number;
};

export enum PlayerEmitterEvent {
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

export type PlayerContext = {
  events: TEventWithTime[];
  timeOffset: number;
  speed: number;
};

export enum PlayerEventType {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  END = 'END',
  REPLAY = 'REPLAY',
  FAST_FORWARD = 'FAST_FORWARD',
  BACK_TO_NORMAL = 'BACK_TO_NORMAL',
}

export type PlayerEvent = { type: PlayerEventType };

export type PlayerState = {
  value: 'inited' | 'playing' | 'paused' | 'ended' | 'skipping';
  context: PlayerContext;
};
