export type Attributes = { [key: string]: boolean | string };

export enum NodeType {
  ELEMENT_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  PROCESSING_INSTRUCTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
}

export type DocumentNode = {
  type: NodeType.DOCUMENT_NODE;
};

export type DocumentTypeNode = {
  type: NodeType.DOCUMENT_TYPE_NODE;
  name: string;
  publicId: string;
  systemId: string;
};

export type ElementNode = {
  type: NodeType.ELEMENT_NODE;
  tagName: string;
  attributes: Attributes;
  isSVG?: boolean;
};

export type TextNode = {
  type: NodeType.TEXT_NODE;
  textContent: string;
  isStyle?: boolean;
};

export type CDataNode = {
  type: NodeType.CDATA_SECTION_NODE;
  textContent: "";
};

export type CommentNode = {
  type: NodeType.COMMENT_NODE;
  textContent: string;
};

export type SerializedNode =
  | DocumentNode
  | DocumentTypeNode
  | ElementNode
  | TextNode
  | CDataNode
  | CommentNode;

export type SerializedNodeWithId = SerializedNode & { id: number };

export interface TNode extends Node {
  __sn: SerializedNodeWithId;
}

export type IdNodeMap = { [key: number]: TNode };

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

export type AddedNodeMutation = {
  parentId: number;
  nextId?: number;
  node: SerializedNodeWithId;
};

type MutationCallbackParam = {
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

export type InputValue = string | boolean;

export type InputCallbackParam = { id: number; value: InputValue };

export type InputCallback = (param: InputCallbackParam) => void;

export type HookResetter = () => void;

export type StyleSheetAddRule = {
  rule: string;
  index?: number;
};

export type StyleSheetDeleteRule = {
  index: number;
};

export type StyleSheetRuleParam = {
  id: number;
  removes?: StyleSheetDeleteRule[];
  adds?: StyleSheetAddRule[];
};

export type StyleSheetRuleCallback = (param: StyleSheetRuleParam) => void;

export type MediaInteractions = "play" | "pause";

export type MediaInteractionParam = {
  id: number;
  type: MediaInteractions;
};

export type MediaInteractionCallback = (param: MediaInteractionParam) => void;

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

export type HooksParam = {
  mutation?: MutationCallBack;
  mousemove?: MousemoveCallBack;
  mouseInteraction?: MouseInteractionCallBack;
  scroll?: ScrollCallback;
  viewportResize?: ViewportResizeCallback;
  input?: InputCallback;
  mediaInteraction?: MediaInteractionCallback;
  styleSheetRule?: StyleSheetRuleCallback;
};

export type PackFn = (ev: TEventWithTime) => string;

export type TEventWithTimeAndMark = TEventWithTime & { v: string };

export type RecordOptions<T> = {
  emit: (e: T | string, isCheckout?: true) => void;
  hooks?: HooksParam;
  pack?: PackFn;
  checkoutEveryNth?: number;
  checkoutEveryNms?: number;
};

export enum EventType {
  DOM_CONTENT_LOADED,
  LOAD,
  FULL_SNAPSHOT,
  INCREMENTAL_SNAPSHOT,
  META,
  CUSTOM,
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
    node: SerializedNodeWithId;
    initialOffset: { top: number; left: number };
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

export type ListenerHandler = () => void;

export type ThrottleOptions = { leading?: boolean; trailing?: boolean };
