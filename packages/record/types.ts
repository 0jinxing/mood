import type { Attributes, AddedNodeMutation } from "@traps/snapshot";

export enum EventType {
  DOM_CONTENT_LOADED,
  LOAD,
  FULL_SNAPSHOT,
  INCREMENTAL_SNAPSHOT,
  META,
  CUSTOM,
}

export enum MouseInteractions {
  MOUSEUP = "MOUSEUP",
  MOUSEDOWN = "MOUSEDOWN",
  CLICK = "CLICK",
  CONTEXTMENU = "CONTEXTMENU",
  DBLCLICK = "DBLCLICK",
  FOCUS = "FOCUS",
  BLUR = "BLUR",
  TOUCHSTART = "TOUCHSTART",
  TOUCHEND = "TOUCHEND",
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
  STYLE_SHEETRULE,
}

export type DomContentLoadedEvent = {
  type: EventType.DOM_CONTENT_LOADED;
  data: {};
};

export type LoadedEvent = {
  type: EventType.LOAD;
  data: {};
};

export type FullSnapshotEvent = {
  type: EventType.FULL_SNAPSHOT;
  data: {
    adds: AddedNodeMutation[];
    offset: { top: number; left: number };
  };
};

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

export type IncrementalData =
  | MutationData
  | MousemoveData
  | MouseInteractionData
  | ScrollData
  | ViewportResizeData
  | InputData
  | MediaInteractionData
  | StyleSheetRuleData;

export type MutationData = {
  source: IncrementalSource.MUTATION;
} & MutationCallbackParam;

export type MousemoveData = {
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE;
  positions: MousePosition[];
};

export type MouseInteractionData = {
  source: IncrementalSource.MOUSE_INTERACTION;
} & MouseInteractionParam;

export type ScrollData = { source: IncrementalSource.SCROLL } & ScrollPosition;

export type ViewportResizeData = {
  source: IncrementalSource.VIEWPORT_RESIZE;
} & ViewportResizeDimention;

export type InputData = {
  source: IncrementalSource.INPUT;
} & InputCallbackParam;

export type MediaInteractionData = {
  source: IncrementalSource.MEDIA_INTERACTION;
} & MediaInteractionParam;

export type StyleSheetRuleData = {
  source: IncrementalSource.STYLE_SHEETRULE;
} & StyleSheetRuleParam;

export type TEvent =
  | DomContentLoadedEvent
  | LoadedEvent
  | FullSnapshotEvent
  | IncrementalSnapshotEvent
  | MetaEvent
  | CustomEvent;

export type TEventWithTime = TEvent & { timestamp: number; delay?: number };

export type TEventWithTimeAndMark = TEventWithTime & { v: string };

export type ListenerHandler = () => void;

export type AttrCursor = {
  $el: Node;
  attributes: Attributes;
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

export type InputValue = string | boolean;

export type HookResetter = () => void;

export type MediaInteractions = "play" | "pause";

export type MutationCallbackParam = {
  texts: TextMutation[];
  attributes: AttrMutation[];
  removes: RemovedNodeMutation[];
  adds: AddedNodeMutation[];
};

export type MutationCallBack = (m: MutationCallbackParam) => void;

export type MousePosition = {
  id: number;
  x: number;
  y: number;
  timeOffset: number;
};

export type MousemoveCallBack = (
  p: MousePosition[],
  source: IncrementalSource.MOUSE_MOVE | IncrementalSource.TOUCH_MOVE
) => void;

type MouseInteractionParam = {
  type: MouseInteractions;
  id: number;
  x: number;
  y: number;
};

export type MouseInteractionCallBack = (param: MouseInteractionParam) => void;

export type ScrollPosition = {
  id: number;
  x: number;
  y: number;
};

export type ScrollCallback = (position: ScrollPosition) => void;

export type ViewportResizeDimention = {
  width: number;
  height: number;
};

export type ViewportResizeCallback = (
  dimention: ViewportResizeDimention
) => void;

export type InputCallbackParam = { id: number; value: InputValue };

export type InputCallback = (param: InputCallbackParam) => void;

export type MediaInteractionParam = {
  id: number;
  type: MediaInteractions;
};

export type MediaInteractionCallback = (param: MediaInteractionParam) => void;

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
