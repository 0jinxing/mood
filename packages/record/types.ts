import { Attributes, AddedNode } from '@mood/snapshot';

export enum EventType {
  DOM_CONTENT_LOADED,
  LOADED,
  FULL_SNAPSHOT,
  INCREMENTAL_SNAPSHOT,
  META,
  CUSTOM
}

export enum MouseInteractions {
  MOUSEUP,
  MOUSEDOWN,
  CLICK,
  CONTEXTMENU,
  DBLCLICK,
  FOCUS,
  BLUR,
  TOUCHSTART,
  TOUCHEND
}

export enum IncrementalSource {
  MUTATION,
  MOUSE_MOVE,
  MOUSE_INTERACTION,
  SCROLL,
  VIEWPORT_RESIZE,
  INPUT,
  TOUCH_MOVE,
  MEDIA_INTERACTION,
  STYLE_SHEETRULE
}

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

export type TextMutation = {
  id: number;
  value: string | null;
};

export type AttrMutation = {
  id: number;
  attributes: Attributes;
};

export type RemovedNodeMutation = {
  id: number;
  parentId: number;
};

export class AddedNodeMutation extends AddedNode {
  parentId: number;
}

export type MutationCallbackParam = {
  texts: TextMutation[];
  attributes: AttrMutation[];
  removes: RemovedNodeMutation[];
  adds: AddedNodeMutation[];
};

type MouseInteractionParam = {
  type: MouseInteractions;
  id: number;
  x: number;
  y: number;
};

export type MouseInteractionData = {
  source: IncrementalSource.MOUSE_INTERACTION;
} & MouseInteractionParam;

export type ScrollPosition = {
  id: number;
  x: number;
  y: number;
};

export type ScrollData = { source: IncrementalSource.SCROLL } & ScrollPosition;

export type ViewportResizeDimention = {
  width: number;
  height: number;
};

export type ViewportResizeData = {
  source: IncrementalSource.VIEWPORT_RESIZE;
} & ViewportResizeDimention;

export type InputValue = string | boolean;

export type InputCallbackParam = { id: number; value: InputValue };

export type InputData = {
  source: IncrementalSource.INPUT;
} & InputCallbackParam;

export type MediaInteractions = 'play' | 'pause';

export type MediaInteractionParam = {
  id: number;
  type: MediaInteractions;
};

export type MediaInteractionData = {
  source: IncrementalSource.MEDIA_INTERACTION;
} & MediaInteractionParam;

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetRuleParam = {
  id: number;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type StyleSheetRuleData = {
  source: IncrementalSource.STYLE_SHEETRULE;
} & StyleSheetRuleParam;

export type MutationData = {
  source: IncrementalSource.MUTATION;
} & MutationCallbackParam;

export type MousePosition = {
  id: number;
  x: number;
  y: number;
  timeOffset: number;
};

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

export type ListenerHandler = () => void;

export type AttrCursor = {
  $el: Node;
  attributes: Attributes;
};

export type MutationCallBack = (m: MutationCallbackParam) => void;

export type HookResetter = () => void;

export type MousemoveCallBack = (
  p: MousePosition[],
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE
) => void;

export type MouseInteractionCallBack = (param: MouseInteractionParam) => void;

export type ScrollCallback = (position: ScrollPosition) => void;

export type ViewportResizeCallback = (
  dimention: ViewportResizeDimention
) => void;

export type InputCallback = (param: InputCallbackParam) => void;

export type MediaInteractionCallback = (param: MediaInteractionParam) => void;

export type StyleSheetRuleCallback = (param: StyleSheetRuleParam) => void;

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

export type RecordOptions<T> = {
  emit: (e: T | string, isCheckout?: true) => void;
  hooks?: HooksParam;
  checkoutEveryNth?: number;
  checkoutEveryNms?: number;
};
