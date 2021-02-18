import { AddedNode } from '@mood/snapshot';
import { CanvasParam } from './canvas';

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

export type IncrementalParam =
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
} & IncrementalParam;

export type MetaEvent = {
  type: EventType.META;
  href: string;
  width: number;
  height: number;
};

export type CanvasEvent = {
  type: EventType.CANVAS;
} & CanvasParam;

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
  | CanvasEvent
  | CustomEvent;

export type RecordEventWithTime = RecordEvent & { timestamp: number };

export type IncEmitHandler = (data: IncrementalParam) => void;

type IsAny<T> = any extends T ? true : false;

type ValueOf<T extends object> = T[keyof T];

type FN = (...args: any[]) => any;

export type MethodKeys<T extends object> = ValueOf<
  {
    [K in keyof T]: K extends string
      ? T[K] extends FN
        ? IsAny<T[K]> extends true
          ? never
          : K
        : never
      : never;
  }
>;

export type PropKeys<T extends object> = ValueOf<
  { [K in keyof T]: T[K] extends FN ? never : K }
>;
