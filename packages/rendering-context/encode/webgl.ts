import { Mirror } from '@mood/snapshot';

export const webGLVars = new WeakMap<RenderingContext, Record<string, WebGLObject[]>>();

export type WebGLObject =
  | WebGLActiveInfo
  | WebGLBuffer
  | WebGLContextEvent
  | WebGLFramebuffer
  | WebGLProgram
  | WebGLQuery
  | WebGLRenderbuffer
  | WebGLSampler
  | WebGLShader
  | WebGLShaderPrecisionFormat
  | WebGLSync
  | WebGLTexture
  | WebGLTransformFeedback
  | WebGLUniformLocation
  | WebGLVertexArrayObject;

export type WebGLObjectEncoded = {
  id: number;
  type: 'WebGLObjectEncoded';
  constructor: string;
  index: number;
  webgl2: boolean;
};

export function isWebGLObjectEncoded(value: any): value is WebGLObjectEncoded {
  return Boolean(value && typeof value === 'object' && value.type === 'WebGLObjectEncoded');
}

export function encodeWebGLObject(
  value: WebGLObject,
  mirror: Mirror,
  context: RenderingContext
): WebGLObjectEncoded {
  return {
    id: mirror.getId(context.canvas),
    webgl2: context instanceof WebGL2RenderingContext,
    type: 'WebGLObjectEncoded',
    constructor: value.constructor.name,
    index: contextVarList(context, value.constructor.name).indexOf(value)
  };
}

export function decodeWebGLObject(value: WebGLObjectEncoded, mirror: Mirror) {
  const context = mirror
    .getNode<HTMLCanvasElement>(value.id)
    ?.getContext(value.webgl2 ? 'webgl2' : 'webgl');

  return webGLVars.get(context!)?.[value.constructor]?.[value.index];
}

export const WebGLConstructorNames: string[] = [
  'WebGLActiveInfo',
  'WebGLBuffer',
  'WebGLContextEvent',
  'WebGLFramebuffer',
  'WebGLProgram',
  'WebGLQuery',
  'WebGLRenderbuffer',
  'WebGLSampler',
  'WebGLShader',
  'WebGLShaderPrecisionFormat',
  'WebGLSync',
  'WebGLTexture',
  'WebGLTransformFeedback',
  'WebGLUniformLocation',
  'WebGLVertexArrayObject',
  // In old Chrome versions, value won't be an instanceof WebGLVertexArrayObject.
  'WebGLVertexArrayObjectOES'
];

export function contextVarList(context: RenderingContext, constructor: string) {
  const map = webGLVars.get(context) || {};

  webGLVars.set(
    context,
    Object.assign(map, {
      [constructor]: map[constructor] || []
    })
  );

  return map[constructor];
}

export function saveWebGLObjectIfValid(context: RenderingContext, value: unknown) {
  if (isWebGLObject(value)) {
    const list = contextVarList(context, value.constructor.name);

    list.includes(value) || list.push(value);
  }
}

export function isWebGLObject(value: unknown): value is WebGLObject {
  try {
    return Boolean(
      value && WebGLConstructorNames.some((name: string) => value.constructor.name === name)
    );
  } catch {
    return false;
  }
}
