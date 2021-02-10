import { AddedNode } from '@mood/snapshot';

import { EventType } from './constant';

import { InputData } from './incremental/input';
import { MediaInteractionData } from './incremental/media-interaction';
import { MouseInteractionData } from './incremental/mouse-interaction';
import { MouseMoveData } from './incremental/mouse-move';
import { MutationData } from './incremental/mutation';
import { OffscreenData } from './incremental/offscreen';
import { ScrollData } from './incremental/scroll';
import { StyleSheetData } from './incremental/style-sheet';
import { ViewportResizeData } from './incremental/viewport-resize';

export type IncrementalData =
  | MutationData
  | MouseMoveData
  | MouseInteractionData
  | ScrollData
  | ViewportResizeData
  | InputData
  | MediaInteractionData
  | StyleSheetData
  | OffscreenData;

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

export type EmitHandle = (data: IncrementalData) => void;

export interface Plain<T = any> {
  $plain?: () => T;
}
