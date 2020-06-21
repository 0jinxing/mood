import rebuild, { buildNodeWithSN } from "@traps/snapshot/rebuild";
import * as mittProxy from "mitt";
import Timer from "./timer";
import { createPlayerService } from "./machine";
import { mirror } from "@traps/common";
import {
  TEventWithTime,
  ViewportResizeDimention,
  EventType,
  FullSnapshotEvent,
  IncrementalSource,
  IncrementalSnapshotEvent,
  IncrementalData,
  AddedNodeMutation,
  MouseInteractions,
} from "@traps/common";
import getInjectStyle from "./styles/inject-style";

import {
  PlayerConfig,
  PlayerEmitterEvent,
  PlayerMetaData,
  ActionWithDelay,
  PlayerEventType,
} from "./types";

import "./styles/index.css";

const mitt = (mittProxy as any).default || mittProxy;

const SKIP_TIME_THRESHOLD = 10 * 1000;
const SKIP_TIME_INTERVAL = 5 * 1000;

const REPLAY_CONSOLE_PREFIX = "[TRAPS WARN]";

const defaultConfig: PlayerConfig = {
  speed: 1,
  root: document.body,
  loadTimeout: 0,
  skipInactive: false,
  showDebug: false,
  liveMode: false,
  insertStyleRules: [],
  triggerFocus: true,
};

export default class Player {
  public $wrapper: HTMLElement;
  public $iframe: HTMLIFrameElement;
  public timer: Timer;

  private $cursor: HTMLElement;
  private events: TEventWithTime[];
  private config: PlayerConfig;
  private emitter: mitt.Emitter = mitt();
  private baselineTime: number = 0;
  private lastPlayedEvent: TEventWithTime;
  private nextUserInteractionEvent: TEventWithTime | null;
  private noramlSpeed: number = -1;
  private service!: ReturnType<typeof createPlayerService>;

  constructor(
    events: Array<TEventWithTime>,
    config: Partial<PlayerConfig> = defaultConfig
  ) {
    if (events.length < 2) throw new Error("Replayer need at least 2 events.");
    this.config = Object.assign({}, defaultConfig, config);
    this.service = createPlayerService({
      events,
      timeOffset: 0,
      speed: config.speed!,
    });
    this.service.start();
    this.events = events;
    this.handleResize = this.handleResize.bind(this);
    this.timer = new Timer(this.config);
    this.setupDOM();
    this.emitter.on(PlayerEmitterEvent.RESIZE, this.handleResize);
  }

  public on(type: string, handler: mitt.Handler) {
    this.emitter.on(type, handler);
  }

  public setConfig(config: Partial<PlayerConfig>) {
    this.config = Object.assign({}, this.config, config);
    if (!this.config.skipInactive) {
      this.noramlSpeed = -1;
    }
  }

  public getMetaData(): PlayerMetaData {
    const firstEvent = this.events[0];
    const lastEvent = this.events[this.events.length - 1];
    return { totalTime: lastEvent.timestamp - firstEvent.timestamp };
  }

  public getCurrentTime(): number {
    return this.timer.timeOffset + this.getTimeOffset();
  }

  public getTimeOffset(): number {
    return this.baselineTime - this.events[0].timestamp;
  }

  public play(timeOffset = 0) {
    this.timer.clear();
    this.baselineTime = this.events[0].timestamp + timeOffset;
    const actions: ActionWithDelay[] = [];
    for (const event of this.events) {
      const isSync = event.timestamp < this.baselineTime;
      const castFn = this.getCastFn(event, isSync);
      if (isSync) castFn();
      else {
        actions.push({
          doAction: () => {
            castFn();
            this.emitter.emit(PlayerEmitterEvent.EVENT_CAST, event);
          },
          delay: this.getDelay(event),
        });
      }
    }
    this.timer.addActions(actions);
    this.timer.start();
    this.service.send({ type: PlayerEventType.PLAY });
    this.emitter.emit(PlayerEmitterEvent.START);
  }

  public pause() {
    this.timer.clear();
    this.service.send({ type: PlayerEventType.PAUSE });
    this.emitter.emit(PlayerEmitterEvent.PAUSE);
  }

  public resume(timeOffset = 0) {
    this.timer.clear();
    this.baselineTime = this.events[0].timestamp + timeOffset;
    const actions = new Array<ActionWithDelay>();
    for (const event of this.events) {
      if (
        event.timestamp <= this.lastPlayedEvent.timestamp ||
        event === this.lastPlayedEvent
      ) {
        continue;
      }
      const castFn = this.getCastFn(event);
      actions.push({
        doAction: castFn,
        delay: this.getDelay(event),
      });
    }
    this.timer.addActions(actions);
    this.timer.start();
    this.service.send({ type: PlayerEventType.RESUME });
    this.emitter.emit(PlayerEmitterEvent.RESUME);
  }

  // TODO: add speed to mouse move timestamp calculation
  private getDelay(event: TEventWithTime): number {
    // Mouse move events was recorded in a throttle function,
    // so we need to find the real timestamp by traverse the time offsets.
    if (
      event.type === EventType.INCREMENTAL_SNAPSHOT &&
      event.data.source === IncrementalSource.MOUSE_MOVE
    ) {
      const firstOffset = event.data.positions[0].timeOffset;
      const firstTimestamp = event.timestamp + firstOffset;
      event.delay = firstTimestamp - this.baselineTime;
      return firstTimestamp - this.baselineTime;
    }
    event.delay = event.timestamp - this.baselineTime;
    return event.timestamp - this.baselineTime;
  }

  private applyIncremental(
    event: TEventWithTime & IncrementalSnapshotEvent,
    isSync: boolean
  ) {
    const { data, timestamp } = event;
    switch (data.source) {
      case IncrementalSource.MUTATION: {
        data.removes.forEach((mutation) => {
          const $el = mirror.getNode(mutation.id);
          const $parent = mirror.getNode(mutation.parentId);
          if (!$el) {
            return;
          }
          mirror.removeNodeFromMap($el);
          if ($parent) {
            $parent.removeChild($el);
          }
        });

        const queue: AddedNodeMutation[] = [];

        const appendNode = (mutation: AddedNodeMutation) => {
          const $parent = mirror.getNode(mutation.parentId);
          if (!$parent) {
            queue.push(mutation);
            return;
          }

          let $next: Node | undefined = undefined;

          if (mutation.nextId) {
            $next = mirror.getNode(mutation.nextId);
          }

          if (mutation.nextId && !$next) {
            queue.push(mutation);
            return;
          }

          const $target = buildNodeWithSN(
            mutation.node,
            this.$iframe.contentDocument!,
            mirror.idNodeMap,
            true
          );

          if ($next && $next.parentElement) {
            // making sure the parent contains the reference nodes
            // before we insert target before next.
            $parent.contains($next)
              ? $parent.insertBefore($target!, $next)
              : $parent.insertBefore($target!, null);
          } else {
            $parent.appendChild($target!);
          }
        };

        data.adds.forEach((mutation) => {
          appendNode(mutation);
        });
        while (queue.length) {
          if (queue.every((m) => !mirror.getNode(m.parentId))) {
            return;
          }

          const mutation = queue.shift()!;
          appendNode(mutation);
        }

        data.texts.forEach((mutation) => {
          const $target = mirror.getNode(mutation.id);
          if (!$target) {
            return;
          }
          $target.textContent = mutation.value;
        });

        data.attributes.forEach((mutation) => {
          const $target = mirror.getNode<Element>(mutation.id);
          if (!$target) {
            return;
          }
          for (const attributeName in mutation.attributes) {
            const value = mutation.attributes[attributeName];
            if (value) {
              $target.setAttribute(attributeName, value + "");
            } else {
              $target.removeAttribute(attributeName);
            }
          }
        });
        break;
      }

      case IncrementalSource.MOUSE_MOVE: {
        if (isSync) {
          const lastPosition = data.positions[data.positions.length - 1];
          this.moveAndHover(lastPosition.x, lastPosition.y, lastPosition.id);
        } else {
          data.positions.forEach((mutation) => {
            const action = {
              doAction: () => {
                this.moveAndHover(mutation.x, mutation.y, mutation.id);
              },
              delay: mutation.timeOffset + timestamp - this.baselineTime,
            };
            this.timer.addAction(action);
          });
        }
        break;
      }

      case IncrementalSource.MOUSE_INTERACTION: {
        const $target = mirror.getNode<HTMLElement>(data.id);
        if (!$target) break;

        const event = new Event(MouseInteractions[data.type].toLowerCase());
        this.emitter.emit(PlayerEmitterEvent.MOUSE_INTERACTION, {
          type: data.type,
          $target,
        });
        const { triggerFocus } = this.config;
        switch (data.type) {
          case MouseInteractions.BLUR: {
            $target.blur && $target.blur();
            break;
          }
          case MouseInteractions.FOCUS: {
            if (triggerFocus && $target.focus) {
              $target.focus({ preventScroll: true });
            }
            break;
          }
          case MouseInteractions.CLICK:
          case MouseInteractions.TOUCHEND:
          case MouseInteractions.TOUCHSTART: {
            if (!isSync) {
              this.moveAndHover(data.x, data.y, data.id);
              this.$cursor.classList.remove("active");
              setTimeout(() => {
                this.$cursor.classList.add("active");
              });
            }
            break;
          }
          default: {
            $target.dispatchEvent(event);
          }
        }
        break;
      }

      case IncrementalSource.SCROLL: {
        const $target = mirror.getNode<HTMLElement>(data.id);
        if (!$target) break;

        if (($target as Node) === this.$iframe.contentDocument) {
          this.$iframe.contentWindow!.scrollTo({
            top: data.y,
            left: data.x,
            behavior: isSync ? "auto" : "smooth",
          });
        } else {
          try {
            $target.scrollTop = data.y;
            $target.scrollLeft = data.x;
          } catch (err) {
            /**
             * Seldomly we may found scroll target was removed before
             * its last scroll event.
             */
          }
        }
        break;
      }

      case IncrementalSource.VIEWPORT_RESIZE: {
        this.emitter.emit(PlayerEmitterEvent.RESIZE, {
          width: data.width,
          height: data.height,
        });
        break;
      }

      case IncrementalSource.MEDIA_INTERACTION: {
        const $target = mirror.getNode<HTMLMediaElement>(data.id);
        if (!$target) break;

        if (data.type === "play") {
          if ($target.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            $target.play();
          } else {
            $target.addEventListener("canplay", () => $target.play());
          }
        } else if (data.type === "pause") {
          $target.pause();
        }
        break;
      }

      case IncrementalSource.INPUT: {
        const $target = mirror.getNode<HTMLInputElement>(data.id);

        if (!$target) break;

        if (typeof data.value === "boolean") {
          $target.checked = data.value;
        } else {
          $target.value = data.value;
        }
        break;
      }

      case IncrementalSource.STYLE_SHEETRULE: {
        const $target = mirror.getNode<HTMLStyleElement>(data.id);
        if (!$target) break;

        const styleSheet = <CSSStyleSheet>$target.sheet;

        if (data.adds) {
          data.adds.forEach(({ rule, index }) => {
            const insertIndex =
              index === undefined
                ? undefined
                : Math.min(index, styleSheet.rules.length);
            try {
              styleSheet.insertRule(rule, insertIndex);
            } catch (e) {
              /**
               * sometimes we may capture rules with browser prefix
               * insert rule with prefixs in other browsers may cause Error
               */
            }
          });
        }

        if (data.removes) {
          data.removes.forEach(({ index }) => styleSheet.deleteRule(index));
        }
        break;
      }
    }
  }

  private moveAndHover(x: number, y: number, id: number) {
    this.$cursor.style.left = `${x}px`;
    this.$cursor.style.top = `${y}px`;
    const $target = mirror.getNode<Element>(id);
    if ($target) {
      this.hoverElement($target);
    }
  }

  private hoverElement($el: Element) {
    this.$iframe
      .contentDocument!.querySelectorAll(".\\:hover")
      .forEach(($hovered) => {
        $hovered.classList.remove(":hover");
      });
    let $current: Element | null = $el;
    while ($current) {
      if ($current.classList) {
        $current.classList.add(":hover");
      }
      $current = $current.parentElement;
    }
  }

  private getCastFn(event: TEventWithTime, isSync = false) {
    let castFn: Function;
    switch (event.type) {
      case EventType.DOM_CONTENT_LOADED:
      case EventType.LOAD: {
        break;
      }
      case EventType.META: {
        castFn = () => {
          const { width, height } = event.data;
          this.emitter.emit(PlayerEmitterEvent.RESIZE, { width, height });
        };
        break;
      }
      case EventType.FULL_SNAPSHOT: {
        castFn = () => {
          this.rebuildFullSnapshot(event);
          this.$iframe.contentWindow!.scrollTo(event.data.initialOffset);
        };
        break;
      }
      case EventType.INCREMENTAL_SNAPSHOT: {
        castFn = () => {
          this.applyIncremental(event, isSync);
          if (event === this.nextUserInteractionEvent) {
            this.nextUserInteractionEvent = null;
            this.restoreSpeed();
          }
          if (this.config.skipInactive && !this.nextUserInteractionEvent) {
            for (const e of this.events) {
              if (e.timestamp <= event.timestamp) continue;
              if (this.isUserInteraction(e)) {
                if (
                  e.delay! - event.delay! >
                  SKIP_TIME_THRESHOLD * this.config.speed
                ) {
                  this.nextUserInteractionEvent = e;
                }
                break;
              }
            }
            if (this.nextUserInteractionEvent) {
              this.noramlSpeed = this.config.speed;
              const skipTime =
                this.nextUserInteractionEvent.delay! - event.delay!;
              const payload = {
                speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), 360),
              };
              this.setConfig(payload);
              this.emitter.emit(PlayerEmitterEvent.SKIP_START, payload);
            }
          }
        };
        break;
      }
    }

    const wrappedCastFn = () => {
      if (castFn) {
        castFn();
      }

      this.lastPlayedEvent = event;
      if (event === this.events[this.events.length - 1]) {
        this.restoreSpeed();
        this.emitter.emit(PlayerEmitterEvent.FINISH);
      }
    };

    return wrappedCastFn;
  }

  private isUserInteraction(event: TEventWithTime): boolean {
    if (event.type !== EventType.INCREMENTAL_SNAPSHOT) {
      return false;
    }
    return (
      event.data.source > IncrementalSource.MUTATION &&
      event.data.source <= IncrementalSource.INPUT
    );
  }

  private restoreSpeed() {
    if (this.noramlSpeed === -1) return;
    const payload = { speed: this.noramlSpeed };
    this.setConfig(payload);
    this.emitter.emit(PlayerEmitterEvent.SKIP_END, payload);
    this.noramlSpeed = -1;
  }

  private rebuildFullSnapshot(event: TEventWithTime & FullSnapshotEvent) {
    const contentDocument = this.$iframe.contentDocument!;
    mirror.idNodeMap = rebuild(event.data.node, contentDocument)[1];

    const $style = document.createElement("style");
    const { documentElement, head } = contentDocument;
    documentElement.insertBefore($style, head);
    const injectStylesRules = getInjectStyle().concat(
      this.config.insertStyleRules
    );

    for (let ind = 0; ind < injectStylesRules.length && $style.sheet; ind++) {
      $style.sheet.insertRule(injectStylesRules[ind], ind);
    }

    this.emitter.emit(PlayerEmitterEvent.FULLSNAPSHOT_REBUILDED);
    this.waitForStylesheetLoad();
  }

  private waitForStylesheetLoad() {
    const { head } = this.$iframe.contentDocument!;
    const unloadSheets: Set<HTMLLinkElement> = new Set();
    let timer: number;
    head
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach(($link: HTMLLinkElement) => {
        if ($link.sheet) return;

        if (unloadSheets.size === 0) {
          this.timer.clear();
          this.emitter.emit(PlayerEmitterEvent.LOAD_STYLESHEET_END);
          timer = window.setTimeout(() => {
            if (this.service.state.matches("playing")) {
              this.resume(this.getCurrentTime());
            }
            timer = -1;
          }, this.config.loadTimeout);
        }
        unloadSheets.add($link);
        $link.addEventListener("load", () => {
          unloadSheets.delete($link);
          if (unloadSheets.size === 0 && timer !== -1) {
            if (this.service.state.matches("playing")) {
              this.resume(this.getCurrentTime());
            }
            this.emitter.emit(PlayerEmitterEvent.LOAD_STYLESHEET_END);
            if (timer) {
              window.clearTimeout(timer);
            }
          }
        });
      });
  }

  private setupDOM() {
    this.$wrapper = document.createElement("div");
    this.$wrapper.classList.add("__wrapper");
    this.config.root.appendChild(this.$wrapper);

    this.$cursor = document.createElement("div");
    this.$cursor.classList.add("__cursor");
    this.$wrapper.appendChild(this.$cursor);

    this.$iframe = document.createElement("iframe");
    this.$iframe.setAttribute("sandbox", "allow-same-origin");
    this.$iframe.setAttribute("scrolling", "no");
    this.$iframe.setAttribute("style", "pointer-events: none");
    this.$wrapper.appendChild(this.$iframe);
  }

  private handleResize(dimension: ViewportResizeDimention) {
    this.$iframe.width = `${dimension.width}px`;
    this.$iframe.height = `${dimension.height}px`;
  }

  private warnNodeNotFound(data: IncrementalData, id: number) {
    console.warn(
      REPLAY_CONSOLE_PREFIX,
      `Node with id '${id}' not found in`,
      data
    );
  }
}
