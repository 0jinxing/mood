import { EmitArg, SourceTypes } from '@mood/record';
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

export function handleEmit(e: EmitArg, context: EmitHandlerContext, sync: boolean) {
  const handlerMap: { [key in SourceTypes]?: EmitHandler<unknown> } = {
    [SourceTypes.MUTATION]: handleMutationEmit,
    [SourceTypes.MOUSE_MOVE]: handleMouseMoveEmit,
    [SourceTypes.MOUSE_INTERACTION]: handleMouseInteractionEmit,
    [SourceTypes.SCROLL]: handleScrollEmit,
    [SourceTypes.VIEWPORT_RESIZE]: handleViewportResizeEmit,
    [SourceTypes.INPUT]: handleInputEmit,
    [SourceTypes.TOUCH_MOVE]: handleMouseMoveEmit,
    [SourceTypes.MEDIA_INTERACTION]: handleMediaInteractionEmit,
    [SourceTypes.STYLE_SHEETRULE]: handleStyleSheetEmit,
    [SourceTypes.SELECTION]: handleSelectionEmit,
    [SourceTypes.CANVAS]: handleRenderingContext2DEmit,
    [SourceTypes.WEBGL]: handleWebGLEmit
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
