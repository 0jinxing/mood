import { FunctionKeys, NonFunctionKeys, ReadonlyKeys } from 'utility-types';

export function getConfigurableProps<T extends abstract new (...args: any) => any>(target: T) {
  const prototype = target.prototype;
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  const keys: string[] = [];

  for (const [key, descriptor] of Object.entries(descriptors)) {
    try {
      if (typeof descriptor.value !== 'function' && descriptor.configurable) {
        keys.push(key);
      }
    } catch {
      // ignore
    }
  }

  return keys as Exclude<NonFunctionKeys<InstanceType<T>>, ReadonlyKeys<InstanceType<T>>>[];
}

export function getConfigurableFuncs<T extends abstract new (...args: any) => any>(target: T) {
  const prototype = target.prototype;
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  const keys: string[] = [];

  for (const [key, descriptor] of Object.entries(descriptors)) {
    try {
      if (typeof descriptor.value === 'function' && descriptor.configurable) {
        keys.push(key);
      }
    } catch {
      // ignore
    }
  }

  return keys as FunctionKeys<InstanceType<T>>[];
}

export const webGLFuncs = getConfigurableFuncs(WebGLRenderingContext);
export const webGLProps = getConfigurableProps(WebGLRenderingContext);

export const webGL2Funcs = getConfigurableFuncs(WebGL2RenderingContext);
export const webGL2Props = getConfigurableProps(WebGL2RenderingContext);

export const canvas2DFuncs = getConfigurableFuncs(CanvasRenderingContext2D);
export const canvas2DProps = getConfigurableProps(CanvasRenderingContext2D);
