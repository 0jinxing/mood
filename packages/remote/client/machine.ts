import { createMachine, interpret } from 'xstate';

export const createClientService = () => {
  return interpret(
    createMachine(
      {
        initial: 'idle',
        states: {
          idle: { on: { READY: { target: 'waiting_first_record' } } },
          waiting_first_record: { on: { FIRST_RECORD: { target: 'connected' } } },
          connected: { on: { STOP: { target: 'stopped', actions: ['stop'] } } },
          stopped: { on: { RESET: { target: 'idle' } } }
        }
      },
      {
        actions: {
          stop() {}
        }
      }
    )
  );
};

export type ClientControlServiceContext = {};

export const createClientControlService = (context: ClientControlServiceContext) => {
  return interpret(
    createMachine({
      context,
      states: {}
    })
  );
};
