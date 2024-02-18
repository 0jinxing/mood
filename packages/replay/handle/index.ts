import { ObserveEmitArg, ST } from '@mood/record';
import { EmitHandlerContext, EmitHandler } from '../types';
import { handleInputEmit } from './input';
import { handleMediaInteractionEmit } from './media-interaction';
import { handleMouseInteractionEmit } from './mouse-interaction';
import { handleMouseMoveEmit } from './mouse-move';
import { handleMutationEmit } from './mutation';
import { handleViewportResizeEmit } from './viewport-resize';
import { handleScrollEmit } from './scroll';
import { handleStyleSheetEmit } from './style-sheet';
import { handleSelectionEmit } from './selection';
import { handleRenderingContext2DEmit } from './canvas';
import { handleWebGLEmit } from './webgl';

export function handleEmit(e: ObserveEmitArg, context: EmitHandlerContext, sync: boolean) {
  const handlerMap: { [key in ST]?: EmitHandler<unknown> } = {
    [ST.MUTATION]: handleMutationEmit,
    [ST.MOUSE_MOVE]: handleMouseMoveEmit,
    [ST.MOUSE_INTERACTION]: handleMouseInteractionEmit,
    [ST.SCROLL]: handleScrollEmit,
    [ST.VIEWPORT_RESIZE]: handleViewportResizeEmit,
    [ST.INPUT]: handleInputEmit,
    [ST.TOUCH_MOVE]: handleMouseMoveEmit,
    [ST.MEDIA_INTERACTION]: handleMediaInteractionEmit,
    [ST.STYLE_SHEETRULE]: handleStyleSheetEmit,
    [ST.SELECTION]: handleSelectionEmit,
    [ST.CANVAS]: handleRenderingContext2DEmit,
    [ST.WEBGL]: handleWebGLEmit
  };

  handlerMap[e.source]?.(e, context, sync);
}

export * from './input';
export * from './media-interaction';
export * from './mouse-interaction';
export * from './mouse-move';
export * from './mutation';
export * from './viewport-resize';
export * from './scroll';
export * from './style-sheet';
export * from './selection';
export * from './webgl';
export * from './canvas';
