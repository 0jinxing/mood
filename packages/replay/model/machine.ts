import { createMachine, interpret } from '@xstate/fsm';

export type PlayerMachineContext = {
  events: unknown[];
};

export const createPlayerMachine = (context: PlayerMachineContext) => {
  const service = interpret(
    createMachine({
      context,
      initial: 'idle',
      states: {
        idle: {},
        playing: {}
      }
    })
  );
};
