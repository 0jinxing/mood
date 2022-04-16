import { SNWithId } from '@mood/snapshot';
import {
  SubscribeToConsoleArg,
  SubscribeToInputArg,
  MediaInteractionArg,
  SubscribeToMouseInteractionArg,
  SubscribeToMouseMoveArg,
  SubscribeToMutationArg,
  SubscribeToScrollArg,
  SubscribeToSelectionArg,
  SubscribeToStyleSheetArg,
  SubscribeToViewportResizeArg
} from './subscribe';

export enum EventType {
  META,
  LOADED,
  DOM_CONTENT_LOADED,
  FULL_SNAPSHOT,
  INCREMENTAL_SNAPSHOT,
  CUSTOM
}

export enum SourceType {
  MUTATION,
  MOUSE_MOVE,
  MOUSE_INTERACTION,
  SCROLL,
  VIEWPORT_RESIZE,
  INPUT,
  TOUCH_MOVE,
  MEDIA_INTERACTION,
  STYLE_SHEETRULE,
  SELECTION,
  CONSOLE
}

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
