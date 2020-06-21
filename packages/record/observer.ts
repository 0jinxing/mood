import { mirror, throttle } from "@traps/common";
import {
  TNode,
  AttrCursor,
  MutationCallBack,
  AddedNodeMutation,
  RemovedNodeMutation,
  MousePosition,
  IncrementalSource,
  MousemoveCallBack,
  MouseInteractionCallBack,
  MouseInteractions,
  ScrollCallback,
  ViewportResizeCallback,
  InputValue,
  InputCallback,
  HookResetter,
  StyleSheetRuleCallback,
  MediaInteractionCallback,
  MediaInteractions,
  ObserverParam,
  HooksParam,
  ListenerHandler,
} from "@traps/common";
import { transformAttr, serializeWithId } from "@traps/snapshot";

import {
  isAncestorRemoved,
  on,
  queryWindowHeight,
  queryWindowWidth,
} from "./utils";
import { deepDelete, isAncestorInSet, isParentRemoved } from "./collection";

const genKey = (id: number, parentId: number) => `${id}@${parentId}`;

const $anchor = document.createElement("a");
$anchor.href = "/";
const baseUrl = $anchor.href;

export function initMutationObserver(cb: MutationCallBack) {
  const observer = new MutationObserver((mutations) => {
    const attrs: AttrCursor[] = [];
    const texts: Array<{ value: string; $el: Node }> = [];
    const removes: RemovedNodeMutation[] = [];
    const adds: AddedNodeMutation[] = [];

    const addedSet = new Set<Node>();
    const removedSet = new Set<Node>();
    const movedSet = new Set<Node>();
    const movedMap = new Map<string, true>();

    const genAdds = ($node: Node | TNode, $parent?: Node | TNode) => {
      if ("__sn" in $node) {
        movedSet.add($node);
        const parentId = $parent ? mirror.getId($parent) : 0;
        if (parentId) {
          movedMap.set(genKey($node.__sn.id, parentId), true);
        }
      } else {
        addedSet.add($node);
        removedSet.delete($node);
      }
      $node.childNodes.forEach(($childNode) => genAdds($childNode));
    };

    mutations.forEach(
      ({ type, target, oldValue, addedNodes, removedNodes, attributeName }) => {
        if (type === "characterData") {
          const value = target.textContent;
          if (value === oldValue) return;
          texts.push({ value: value!, $el: target });
        } else if (type === "attributes") {
          const value = (target as HTMLElement).getAttribute(attributeName!);
          if (oldValue === value) return;
          let current = attrs.find((a) => a.$el === target);
          if (!current) {
            current = { $el: target, attributes: {} };
            attrs.push(current);
          }
          current.attributes[attributeName!] = transformAttr(
            attributeName!,
            value!,
            baseUrl
          );
        } else if (type === "childList") {
          addedNodes.forEach(($node) => genAdds($node, target));
          removedNodes.forEach(($node) => {
            const id = mirror.getId($node);
            const parentId = mirror.getId(target);
            if (addedSet.has($node)) {
              deepDelete(addedSet, $node);
              removedSet.add($node);
            } else if (addedSet.has(target) && !id) {
              /**
               * If target was newly added and removed child node was
               * not serialized, it means the child node has been removed
               * before callback fired, so we can ignore it because
               * newly added node will be serialized without child nodes.
               */
            } else if (isAncestorRemoved(target as TNode)) {
              /**
               * If parent id was not in the mirror map any more, it
               * means the parent node has already been removed. So
               * the node is also removed which we do not need to track
               * and replay.
               */
            } else if (
              movedSet.has($node) &&
              movedMap.get(genKey(id, parentId))
            ) {
              deepDelete(movedSet, $node);
            } else {
              removes.push({ parentId, id });
            }
            mirror.removeNodeFromMap($node as TNode);
          });
        }
      }
    );

    const addQueue: Node[] = [];

    const pushAdd = ($node: Node) => {
      const parentId = mirror.getId($node.parentNode!);

      const nextId = $node.nextSibling
        ? mirror.getId(($node.nextSibling as Node) as TNode)
        : undefined;

      if (!parentId || nextId === 0) {
        addQueue.push($node);
        return;
      }

      adds.push({
        parentId,
        nextId,
        node: serializeWithId($node, document, mirror.idNodeMap, true)!,
      });
    };

    movedSet.forEach(($node) => pushAdd($node));

    for (const $node of addedSet) {
      if (
        !isAncestorInSet(removedSet, $node) &&
        !isParentRemoved(removes, $node)
      ) {
        pushAdd($node);
      } else if (isAncestorInSet(movedSet, $node)) {
        pushAdd($node);
      } else {
        removedSet.add($node);
      }
    }

    while (addQueue.length) {
      if (
        addQueue.every(
          ($node) => !mirror.getId(($node.parentNode as Node) as TNode)
        )
      ) {
        /**
         * If all nodes in queue could not find a serialized parent,
         * it may be a bug or corner case. We need to escape the
         * dead while loop at once.
         */
        break;
      }
      pushAdd(addQueue.shift()!);
    }

    const payload = {
      texts: texts
        .map((text) => ({
          id: mirror.getId(text.$el as TNode),
          value: text.value,
        }))
        .filter((text) => mirror.has(text.id)),
      attributes: attrs.map((attr) => ({
        id: mirror.getId(attr.$el as TNode),
        attributes: attr.attributes,
      })),
      removes,
      adds,
    };

    if (
      !payload.texts.length &&
      !payload.attributes.length &&
      !payload.removes.length &&
      !payload.adds.length
    ) {
      return;
    }
    cb(payload);
  });
  observer.observe(document, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
  });
  return observer;
}

export function initMouseMoveObserver(cb: MousemoveCallBack): ListenerHandler {
  let positions: MousePosition[] = [];
  let timeBaseline: number = 0;
  const throttleCb = throttle((isTouch: boolean) => {
    const totalOffset = Date.now() - timeBaseline!;
    cb(
      positions.map((p) => {
        p.timeOffset -= totalOffset;
        return p;
      }),
      isTouch ? IncrementalSource.TOUCH_MOVE : IncrementalSource.MOUSE_MOVE
    );
    // @MARK cleanup
    positions = [];
  }, 500);
  const updatePosition = throttle<MouseEvent | TouchEvent>(
    (event) => {
      const { target } = event;
      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;

      timeBaseline || (timeBaseline = Date.now());
      positions.push({
        x: clientX,
        y: clientY,
        id: mirror.getId(target as TNode),
        timeOffset: Date.now() - timeBaseline,
      });
      throttleCb(event instanceof TouchEvent);
    },
    Math.floor(1000 / 30),
    { trailing: false }
  );
  const handlers = [
    on("mousemove", updatePosition),
    on("touchmove", updatePosition),
  ];
  return () => handlers.forEach((h) => h());
}

export function initMouseInteractionObserver(
  cb: MouseInteractionCallBack
): ListenerHandler {
  const handlers: ListenerHandler[] = [];
  const getHandler = (eventKey: keyof typeof MouseInteractions) => {
    return (event: MouseEvent | TouchEvent) => {
      const id = mirror.getId(event.target as TNode);
      const { clientX, clientY } =
        event instanceof TouchEvent ? event.changedTouches[0] : event;
      cb({ type: MouseInteractions[eventKey], id, x: clientX, y: clientY });
    };
  };
  Object.keys(MouseInteractions).forEach(
    (eventKey: keyof typeof MouseInteractions) => {
      const eventName = eventKey.replace(/\_/g, "").toLowerCase();
      const handler = getHandler(eventKey);
      handlers.push(on(eventName, handler));
    }
  );
  return () => {
    handlers.forEach((h) => h());
  };
}

export function initScrollObserver(cb: ScrollCallback): ListenerHandler {
  const updatePosition = throttle<UIEvent>((event) => {
    const { target } = event;
    const id = mirror.getId(target as TNode);
    let $scroll: HTMLElement = target as HTMLElement;
    if (target === document) $scroll = document.scrollingElement as HTMLElement;
    cb({ id, x: $scroll.scrollLeft, y: $scroll.scrollTop });
  }, 100);
  return on("scroll", updatePosition);
}

export function initViewportResizeObserver(
  cb: ViewportResizeCallback
): ListenerHandler {
  const updateDimension = throttle(() => {
    const height = queryWindowHeight();
    const width = queryWindowWidth();
    cb({ height, width });
  }, 200);
  return on("resize", updateDimension, window);
}

export function hookSetter<T>(
  target: T,
  key: string | number | symbol,
  descriptor: PropertyDescriptor,
  isRevoked?: boolean
): HookResetter {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(
    target,
    key,
    isRevoked
      ? descriptor
      : {
          set(value) {
            // put hooked setter into event loop to avoid of set latency
            setTimeout(() => {
              descriptor.set!.call(this, value);
            }, 0);
            original && original.set && original.set.call(this, value);
          },
        }
  );
  return () => hookSetter(target, key, original || {}, true);
}

const lastInputValueMap: WeakMap<EventTarget, InputValue> = new WeakMap();
export function initInputObserver(cb: InputCallback): ListenerHandler {
  const cbWithDedup = (
    $target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
    value: InputValue
  ) => {
    const lastInputValue = lastInputValueMap.get($target);
    if (!lastInputValue || lastInputValue !== value) {
      lastInputValueMap.set($target, value);
      const id = mirror.getId(($target as Node) as TNode);
      cb({ value, id });
    }
  };

  const eventHandler = (event: Event) => {
    const { target } = event;

    if (
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement) &&
      !(target instanceof HTMLInputElement)
    ) {
      return;
    }

    const value: InputValue =
      target instanceof HTMLInputElement
        ? target.value || target.checked
        : target.value;
    cbWithDedup(target, value);
    const inputType = target.type;
    const name = target.name;
    if (inputType === "radio" && name && value) {
      const $$radio = document.querySelectorAll(
        `input[type=radio][name=${name}]`
      );
      $$radio.forEach(($el) => {
        $el !== target && cbWithDedup($el as HTMLInputElement, !value);
      });
    }
  };

  const handlers: Array<ListenerHandler | HookResetter> = [
    "input",
    "change",
  ].map((eventName) => {
    return on(eventName, eventHandler);
  });

  const hookProperties: Array<[HTMLElement, string]> = [
    [HTMLInputElement.prototype, "value"],
    [HTMLInputElement.prototype, "checked"],
    [HTMLSelectElement.prototype, "value"],
    [HTMLTextAreaElement.prototype, "value"],
  ];

  const hookHandlers = hookProperties.map(([$target, key]) =>
    hookSetter<HTMLElement>($target, key, {
      set() {
        eventHandler({ target: this } as Event);
      },
    })
  );
  handlers.push(...hookHandlers);

  return () => {
    handlers.forEach((h) => h());
  };
}

export function initStyleSheetObserver(
  cb: StyleSheetRuleCallback
): ListenerHandler {
  const insertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
    const id = mirror.getId(this.ownerNode as TNode);
    id && cb({ id, adds: [{ rule, index }] });
    return insertRule.apply(this, [rule, index]);
  };

  const deleteRule = CSSStyleSheet.prototype.deleteRule;
  CSSStyleSheet.prototype.deleteRule = function (index: number) {
    const id = mirror.getId(this.ownerNode as TNode);
    id && cb({ id, removes: [{ index }] });
    return deleteRule.apply(this, [index]);
  };

  return () => {
    CSSStyleSheet.prototype.insertRule = insertRule;
    CSSStyleSheet.prototype.deleteRule = deleteRule;
  };
}

export function initMediaInteractionObserver(cb: MediaInteractionCallback) {
  const handler = (type: MediaInteractions) => (event: Event) => {
    const { target } = event;
    target && cb({ type, id: mirror.getId(target as TNode) });
  };
  const handlers = [on("play", handler("play")), on("pause", handler("pause"))];
  return () => {
    handlers.forEach((h) => h());
  };
}

export function mergeHooks(observer: ObserverParam, hooks: HooksParam) {
  Object.keys(hooks).forEach((key: keyof HooksParam) => {
    observer[key] = (...args: any[]) => {
      hooks[key]?.apply(null, args);
      observer[key].apply(null, args);
    };
  });
}

export default function initObservers(
  observer: ObserverParam,
  hooks: HooksParam = {}
): ListenerHandler {
  mergeHooks(observer, hooks);
  const {
    mutation,
    mousemove,
    mouseInteraction,
    scroll,
    viewportResize,
    input,
    mediaInteraction,
    styleSheetRule,
  } = observer;

  const mutationObserver = initMutationObserver(mutation);
  const mousemoveHandler = initMouseMoveObserver(mousemove);
  const mouseInteractionHandler = initMouseInteractionObserver(
    mouseInteraction
  );
  const scrollHandler = initScrollObserver(scroll);
  const viewportResizeHandler = initViewportResizeObserver(viewportResize);
  const inputHandler = initInputObserver(input);
  const mediaInteractionHandler = initMediaInteractionObserver(
    mediaInteraction
  );
  const styleSheetObserver = initStyleSheetObserver(styleSheetRule);

  return () => {
    mutationObserver.disconnect();
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
    mediaInteractionHandler();
    styleSheetObserver();
  };
}
