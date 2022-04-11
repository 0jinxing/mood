import { SNWithId } from '@mood/snapshot';
import { ET } from './constant';
import { InputParam } from './subscribe/input';
import { MediaInteractionParam } from './subscribe/media-interaction';
import { MouseInteractionParam } from './subscribe/mouse-interaction';
import { MouseMoveParam } from './subscribe/mouse-move';
import { MutationParam } from './subscribe/mutation';
import { ScrollParam } from './subscribe/scroll';
import { SelectionParams } from './subscribe/selection';
import { StyleSheetParam } from './subscribe/style-sheet';
import { ViewportResizeParam } from './subscribe/viewport-resize';

export type IncrementalParam =
  | MutationParam
  | MouseMoveParam
  | MouseInteractionParam
  | ScrollParam
  | ViewportResizeParam
  | InputParam
  | MediaInteractionParam
  | StyleSheetParam
  | SelectionParams;

export type DomContentLoadedEvent = {
  type: ET.DOM_CONTENT_LOADED;
};

export type LoadedEvent = {
  type: ET.LOADED;
};

export type FullSnapshotEvent = {
  type: ET.FULL_SNAPSHOT;
  adds: SNWithId[];
  offset: [top: number, left: number];
};

export type IncrementalSnapshotEvent = {
  type: ET.INCREMENTAL_SNAPSHOT;
} & IncrementalParam;

export type MetaEvent = {
  type: ET.META;
  href: string;
  width: number;
  height: number;
};

export type CustomEvent<T = unknown> = {
  type: ET.CUSTOM;
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

export type EmitHandler = (data: IncrementalParam) => void;
