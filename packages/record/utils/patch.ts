const flags = new WeakMap<Object, boolean>();
const handlers = new WeakMap();

export type Patch = { k: string; v: unknown; setter: boolean };

export type PatchHandler = (patch: Patch) => void;

/**
 *  hook object's property, 需要有一个类似事件代理的机制
 */
export function patch(target: Object, cb: PatchHandler) {
  const prototype = Object.getPrototypeOf(target);
  if (!flags.has(target)) {
    flags.set(target, true);
  }
  return flags;
}
