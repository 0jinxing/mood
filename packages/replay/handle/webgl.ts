import { WebGLEmitArg } from '@mood/record';
import { EmitHandler } from '../types';
import { decode, saveWebGLObjectIfValid } from '@mood/rendering-context';

export const handleWebGLEmit: EmitHandler<WebGLEmitArg> = (event, { mirror }) => {
  const canvas = mirror.getNode<HTMLCanvasElement>(event.id);
  const gl = canvas?.getContext(event.webgl2 ? 'webgl2' : 'webgl') as
    | WebGLRenderingContext
    | WebGL2RenderingContext;

  for (const op of event.ops) {
    const prop = gl?.[op.key as keyof typeof gl];
    if (prop && typeof prop === 'function') {
      const args = decode(op.value, mirror);
      const result = prop.apply(gl, args);
      saveWebGLObjectIfValid(gl, result);
    } else if (gl) {
      Object.assign(gl, { [op.key]: decode(op.value, mirror) });
    }
  }
};
