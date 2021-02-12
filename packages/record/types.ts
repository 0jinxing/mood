import { AddedNode } from '@mood/snapshot';

import { EventType } from './constant';

import { InputParam } from './incremental/input';
import { MediaInteractionParam } from './incremental/media-interaction';
import { MouseInteractionParam } from './incremental/mouse-interaction';
import { MouseMoveParam } from './incremental/mouse-move';
import { MutationParam } from './incremental/mutation';
import { OffscreenParam } from './incremental/offscreen';
import { ScrollParam } from './incremental/scroll';
import { StyleSheetParam } from './incremental/style-sheet';
import { ViewportResizeParam } from './incremental/viewport-resize';

export type IncrementalData =
  | MutationParam
  | MouseMoveParam
  | MouseInteractionParam
  | ScrollParam
  | ViewportResizeParam
  | InputParam
  | MediaInteractionParam
  | StyleSheetParam
  | OffscreenParam;

export type DomContentLoadedEvent = {
  type: EventType.DOM_CONTENT_LOADED;
};

export type LoadedEvent = {
  type: EventType.LOADED;
};

export type FullSnapshotEvent = {
  type: EventType.FULL_SNAPSHOT;
  adds: AddedNode[];
  offset: [top: number, left: number];
};

export type IncrementalSnapshotEvent = {
  type: EventType.INCREMENTAL_SNAPSHOT;
} & IncrementalData;

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

export type IncEmitHandler = (data: IncrementalData) => void;
