import { SNWithId } from '@mood/snapshot';
import { EventType } from './constant';
import { SubscribeToConsoleArg } from './subscribe/console';
import { SubscribeToInputArg } from './subscribe/input';
import { MediaInteractionArg } from './subscribe/media-interaction';
import { SubscribeToMouseInteractionArg } from './subscribe/mouse-interaction';
import { SubscribeToMouseMoveArg } from './subscribe/mouse-move';
import { SubscribeToMutationArg } from './subscribe/mutation';
import { SubscribeToScrollArg } from './subscribe/scroll';
import { SubscribeToSelectionArg } from './subscribe/selection';
import { SubscribeToStyleSheetArg } from './subscribe/style-sheet';
import { SubscribeToViewportResizeArg } from './subscribe/viewport-resize';

export type SubscribeEmitArg =
  | SubscribeToMutationArg
  | SubscribeToMouseMoveArg
  | SubscribeToMouseInteractionArg
  | SubscribeToScrollArg
  | SubscribeToViewportResizeArg
  | SubscribeToInputArg
  | MediaInteractionArg
  | SubscribeToStyleSheetArg
  | SubscribeToSelectionArg
  | SubscribeToConsoleArg;

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
} & SubscribeEmitArg;

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

export type EmitHandler = (data: SubscribeEmitArg) => void;
