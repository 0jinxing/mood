const store = new WeakMap();
const handlers = new WeakMap();

export function vars() {}

/**
 *  hook object's property, 需要有一个类似事件代理的机制
 */
export function patch(target: Object) {
  if (store.has(target)) return;
  Object.keys(target).forEach(key => {});

  return store;
}
