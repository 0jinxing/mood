import { SNWithId } from '@mood/snapshot';
import { EventType } from './constant';
import { InputParam } from './subscribe/input';
import { MediaInteractionParam } from './subscribe/media-interaction';
import { MouseInteractionParam } from './subscribe/mouse-interaction';
import { MouseMoveParam } from './subscribe/mouse-move';
import { MutationParam } from './subscribe/mutation';
import { ScrollParam } from './subscribe/scroll';
import { StyleSheetParam } from './subscribe/style-sheet';
import { ViewportResizeParam } from './subscribe/viewport-resize';

export type IncrementalParam =
  | MutationParam
  | MouseMoveParam
  | MouseInteractionParam
  | ScrollParam
  | ViewportResizeParam
  | InputParam
  | MediaInteractionParam
  | StyleSheetParam;

export type DomContentLoadedEvent = {
  type: EventType.DOM_CONTENT_LOADED;
};

export type LoadedEvent = {
  type: EventType.LOADED;
};

export type FullSnapshotEvent = {
  type: EventType.FULL_SNAPSHOT;
  adds: SNWithId[];
  offset: [top: number, left: number];
};

export type IncrementalSnapshotEvent = {
  type: EventType.INCREMENTAL_SNAPSHOT;
} & IncrementalParam;

export type MetaEvent = {
  type: EventType.META;
  href: string;
  width: number;
  height: number;
};

export type CustomEvent<T = unknown> = {
  type: EventType.CUSTOM;
  tag: string;
  payload: T;
};

export type RecordEvent =
  | DomContentLoadedEvent
  | LoadedEvent
  | FullSnapshotEvent
  | IncrementalSnapshotEvent
  | MetaEvent
  | CustomEvent;

export type RecordEventWithTime = RecordEvent & { timestamp: number };

export type EmitHandler = (data: IncrementalParam) => void;

