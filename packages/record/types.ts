import { AddedNode } from '@mood/snapshot';
import { EventType, IncrementalSource } from './constant';

import { InputCallback, InputCallbackParam } from './observer/input';
import { MediaInteractionCallback, MediaInteractionParam } from './observer/media-interaction';
import { MouseInteractionCallBack, MouseInteractionParam } from './observer/mouse-interaction';
import { MousemoveCallBack, MousePosition } from './observer/mouse-move';
import { MutationCallBack, MutationCallbackParam } from './observer/mutation';
import { ScrollCallback, ScrollPosition } from './observer/scroll';
import { StyleSheetRuleCallback, StyleSheetRuleParam } from './observer/style-sheet';
import { ViewportResizeCallback, ViewportResizeDimention } from './observer/viewport-resize';

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
} & MouseInteractionParam;

export type ScrollData = { source: IncrementalSource.SCROLL } & ScrollPosition;

export type ViewportResizeData = {
  source: IncrementalSource.VIEWPORT_RESIZE;
} & ViewportResizeDimention;

export type MediaInteractionData = {
  source: IncrementalSource.MEDIA_INTERACTION;
} & MediaInteractionParam;

export type StyleSheetRuleData = {
  source: IncrementalSource.STYLE_SHEETRULE;
} & StyleSheetRuleParam;

export type MutationData = {
  source: IncrementalSource.MUTATION;
} & MutationCallbackParam;

export type InputData = {
  source: IncrementalSource.INPUT;
} & InputCallbackParam;

export type MousemoveData = {
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE;
  positions: MousePosition[];
};

export type IncrementalData =
  | MutationData
  | MousemoveData
  | MouseInteractionData
  | ScrollData
  | ViewportResizeData
  | InputData
  | MediaInteractionData
  | StyleSheetRuleData;

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

export type ObserverParam = {
  mutation: MutationCallBack;
  mousemove: MousemoveCallBack;
  mouseInteraction: MouseInteractionCallBack;
  scroll: ScrollCallback;
  viewportResize: ViewportResizeCallback;
  input: InputCallback;
  mediaInteraction: MediaInteractionCallback;
  styleSheetRule: StyleSheetRuleCallback;
};

export type HooksParam = Partial<ObserverParam>;
