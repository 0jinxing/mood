import type { Mirror } from '@mood/snapshot';

export enum ET {
  META,
  LOADED,
  DOM_CONTENT_LOADED,
  SNAPSHOT,
  DELTA
}

export enum ST {
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
  CANVAS,
  WEBGL
}

export type ObserveFunc<T> = (
  emit: (data: T) => void,
  options: { mirror: Mirror; doc: Document }
) => () => void;
