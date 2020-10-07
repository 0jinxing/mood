import { AddedNode } from '@mood/snapshot';
import { EventType, IncrementalSource } from './constant';
import { ErrorCb, ErrorCbParam } from './observer/global-error';
import { FetchCb, FetchCbParam } from './observer/request-fetch';

import { InputCb, InputCbParam } from './observer/input';
import { LogCb, LogCbParam } from './observer/log';
import {
  MediaInteractionCb,
  MediaInteractionCbParam
} from './observer/media-interaction';
import {
  MouseInteractionCb,
  MouseInteractionCbParam
} from './observer/mouse-interaction';
import { MousemoveCb, MousePosition } from './observer/mouse-move';
import { MutationCb, MutationCbParam } from './observer/mutation';
import { ScrollCb, ScrollCbParam } from './observer/scroll';
import {
  StyleSheetCb,
  StyleSheetCbParam
} from './observer/style-sheet';
import {
  ViewportResizeCb,
  ViewportResizeCbParam
} from './observer/viewport-resize';
import { XhrCb, XhrCbParam } from './observer/request-xhr';

export type DomContentLoadedEvent = {
  type: EventType.DOM_CONTENT_LOADED;
};

export type LoadedEvent = {
  type: EventType.LOADED;
};

export type FullSnapshotEvent = {
  type: EventType.FULL_SNAPSHOT;
  data: {
    adds: AddedNode[];
    offset: { top: number; left: number };
  };
};

export type MouseInteractionData = {
  source: IncrementalSource.MOUSE_INTERACTION;
} & MouseInteractionCbParam;

export type ScrollData = { source: IncrementalSource.SCROLL } & ScrollCbParam;

export type ViewportResizeData = {
  source: IncrementalSource.VIEWPORT_RESIZE;
} & ViewportResizeCbParam;

export type MediaInteractionData = {
  source: IncrementalSource.MEDIA_INTERACTION;
} & MediaInteractionCbParam;

export type StyleSheetRuleData = {
  source: IncrementalSource.STYLE_SHEETRULE;
} & StyleSheetCbParam;

export type MutationData = {
  source: IncrementalSource.MUTATION;
} & MutationCbParam;

export type InputData = {
  source: IncrementalSource.INPUT;
} & InputCbParam;

export type MousemoveData = {
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE;
  positions: MousePosition[];
};

export type XhrData = { source: IncrementalSource.XHR } & XhrCbParam;

export type FetchData = {
  source: IncrementalSource.FETCH;
} & FetchCbParam;

export type LogData = { source: IncrementalSource.LOG } & LogCbParam;

export type ErrorData = {
  source: IncrementalSource.ERROR;
} & ErrorCbParam;

export type IncrementalData =
  | MutationData
  | MousemoveData
  | MouseInteractionData
  | ScrollData
  | ViewportResizeData
  | InputData
  | MediaInteractionData
  | StyleSheetRuleData
  | XhrData
  | FetchData
  | LogData
  | ErrorData;

export type IncrementalSnapshotEvent = {
  type: EventType.INCREMENTAL_SNAPSHOT;
  data: IncrementalData;
};

export type MetaEvent = {
  type: EventType.META;
  data: { href: string; width: number; height: number };
};

export type CustomEvent<T = unknown> = {
  type: EventType.CUSTOM;
  data: { tag: string; payload: T };
};

export type TEvent =
  | DomContentLoadedEvent
  | LoadedEvent
  | FullSnapshotEvent
  | IncrementalSnapshotEvent
  | MetaEvent
  | CustomEvent;

export type TEventWithTime = TEvent & { timestamp: number; delay?: number };

export type ObserveParam = {
  mutation: MutationCb;
  mousemove: MousemoveCb;
  mouseInteraction: MouseInteractionCb;
  scroll: ScrollCb;
  viewportResize: ViewportResizeCb;
  input: InputCb;
  mediaInteraction: MediaInteractionCb;
  styleSheetRule: StyleSheetCb;
  xhrRequest: XhrCb;
  fetchRequest: FetchCb;
  log: LogCb;
  globalError: ErrorCb;
};

export type HooksParam = Partial<ObserveParam>;
