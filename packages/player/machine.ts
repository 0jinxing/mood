import {
  createMachine,
  EventObject,
  Typestate,
  InterpreterStatus,
  StateMachine,
} from "@xstate/fsm";
import type { PlayerContext, PlayerEvent, PlayerState } from "./types";

export function toEventObject<E extends EventObject>(event: string | E): E {
  return (typeof event === "string" ? { type: event } : event) as E;
}

export const INIT_EVENT: EventObject = { type: "xstate.init" };

export const executeStateActions = <
  C extends object,
  E extends EventObject = any,
  S extends Typestate<C> = any
>(
  state: StateMachine.State<C, E, S>,
  event: E | typeof INIT_EVENT
) => {
  state.actions.forEach(
    ({ exec }) => exec && exec(state.context, event as any)
  );
};

export const interpret = <
  C extends object,
  E extends EventObject = EventObject,
  S extends Typestate<C> = any
>(
  machine: StateMachine.Machine<C, E, S>
): StateMachine.Service<C, E, S> => {
  let state: StateMachine.State<C, E, S> = machine.initialState;
  let status: InterpreterStatus = InterpreterStatus.NotStarted;
  const listenerSet = new Set<StateMachine.StateListener<typeof state>>();

  const service: StateMachine.Service<C, E, S> = {
    send: (event: E | string) => {
      if (status !== InterpreterStatus.Running) return;
      state = machine.transition(state, event);
      executeStateActions(state, toEventObject(event));
      listenerSet.forEach((handler) => handler(state));
    },
    subscribe: (handler: StateMachine.StateListener<typeof state>) => {
      listenerSet.add(handler);
      handler(state);
      return {
        unsubscribe: () => listenerSet.delete(handler),
      };
    },
    start: () => {
      status = InterpreterStatus.Running;
      executeStateActions(state, INIT_EVENT);
      return service;
    },
    stop: () => {
      status = InterpreterStatus.Stopped;
      listenerSet.clear();
      return service;
    },
    get state() {
      return state;
    },
    get status() {
      return status;
    },
  };

  return service;
};

export function createPlayerService(context: PlayerContext) {
  const playerMachine = createMachine<PlayerContext, PlayerEvent, PlayerState>({
    id: "player",
    context,
    initial: "inited",
    states: {
      inited: { on: { PLAY: "playing" } },
      playing: {
        on: { PAUSE: "paused", END: "ended", FAST_FORWARD: "skipping" },
      },
      paused: { on: { RESUME: "playing" } },
      skipping: { on: { BACK_TO_NORMAL: "playing" } },
      ended: { on: { REPLAY: "playing" } },
    },
  });

  return interpret(playerMachine);
}
