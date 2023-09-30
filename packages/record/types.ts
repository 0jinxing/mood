import { SNWithId } from '@mood/snapshot';
import {
  SubscribeToInputArg,
  SubscribeToMediaInteractionArg,
  SubscribeToMouseInteractionArg,
  SubscribeToMouseMoveArg,
  SubscribeToMutationArg,
  SubscribeToScrollArg,
  SubscribeToSelectionArg,
  SubscribeToStyleSheetArg,
  SubscribeToViewportResizeArg
} from './observers';

export enum EventTypes {
  META,
  LOADED,
  DOM_CONTENT_LOADED,
  FULL_SNAPSHOT,
  INCREMENTAL_SNAPSHOT,
  CUSTOM
}

export enum SourceTypes {
  MUTATION,
  MOUSE_MOVE,
  MOUSE_INTERACTION,
  SCROLL,
  VIEWPORT_RESIZE,
  INPUT,
  TOUCH_MOVE,
  MEDIA_INTERACTION,
  STYLE_SHEETRULE,
  SELECTION
}

export type SubscribeEmitArg =
  | SubscribeToMutationArg
  | SubscribeToMouseMoveArg
  | SubscribeToMouseInteractionArg
  | SubscribeToScrollArg
  | SubscribeToViewportResizeArg
  | SubscribeToInputArg
  | SubscribeToMediaInteractionArg
  | SubscribeToStyleSheetArg
  | SubscribeToSelectionArg;

export type DomContentLoadedEvent = {
  type: EventTypes.DOM_CONTENT_LOADED;
};

export type LoadedEvent = {
  type: EventTypes.LOADED;
};

export type FullSnapshotEvent = {
  type: EventTypes.FULL_SNAPSHOT;
  adds: SNWithId[];
  offset: [top: number, left: number];
};

export type IncrementalSnapshotEvent = {
  type: EventTypes.INCREMENTAL_SNAPSHOT;
} & SubscribeEmitArg;

export type MetaEvent = {
  type: EventTypes.META;
  href: string;
  width: number;
  height: number;
};

export type CustomEvent<T = unknown> = {
  type: EventTypes.CUSTOM;
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
