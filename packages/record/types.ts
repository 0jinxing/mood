import { AddedNode } from '@mood/snapshot';
import { EventType } from './constant';

import { InputData } from './observer/input';
import { MediaInteractionData } from './observer/media-interaction';
import { MouseInteractionData } from './observer/mouse-interaction';
import { MouseMoveData } from './observer/mouse-move';
import { MutationData } from './observer/mutation';
import { ScrollData } from './observer/scroll';
import { StyleSheetData } from './observer/style-sheet';
import { ViewportResizeData } from './observer/viewport-resize';

export type IncrementalData =
  | MutationData
  | MouseMoveData
  | MouseInteractionData
  | ScrollData
  | ViewportResizeData
  | InputData
  | MediaInteractionData
  | StyleSheetData;

export type DomContentLoadedEvent = {
  type: EventType.DOM_CONTENT_LOADED;
};

export type LoadedEvent = {
  type: EventType.LOADED;
};

export type FullSnapshotEvent = {
  type: EventType.FULL_SNAPSHOT;
  adds: AddedNode[];
  offset: { top: number; left: number };
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

export type EmitHandle = (data: IncrementalData) => void;
