import { assign, createMachine, interpret } from 'xstate';
import { EmbedBuffer, Messager } from '../utils';
import { RecordEventWithTime, record } from '@mood/record';

export type EmbedServiceContext = {
  buffer: EmbedBuffer<RecordEventWithTime>;
  messager: Messager;
  dispose?: Partial<Record<string, () => void>>;
};

export const createEmbedService = (context: EmbedServiceContext) => {
  return interpret(
    createMachine(
      {
        context,
        initial: 'idle',
        states: {
          idle: { on: { START: { target: 'ready', actions: ['start'] } } },
          ready: { on: { CONNECT: { target: 'connected', actions: ['connect'] } } },
          connected: { on: { STOP: { target: 'idle', actions: ['stop'] } } }
        }
      },
      {
        actions: {
          start() {},
          connect: assign(context => {
            const stop = record({
              emit(e) {
                const id = context.buffer.add(e);
                context.messager.send(context.buffer.buffer[id]);
              }
            });
            return { ...context, dispose: { ...context.dispose, connect: stop } };
          }),

          stop(context) {
            context.dispose?.['connect']?.();
            context.buffer.reset();
          }
        }
      }
    )
  );
};

export type EmbedControlServiceContext = {
  messager: Messager;
};

export const createEmbedControlService = (context: EmbedControlServiceContext) => {
  return createMachine(
    {
      context,
      initial: 'not_control',
      states: {
        not_control: { on: { REQUEST: { target: 'requesting' } } },
        requesting: { on: { ACCEPT: { target: 'controlled', actions: ['accept'] } } },
        controlled: { on: { STOP: { target: 'not_control' } } }
      }
    },
    {
      actions: {
        accept(context) {
          context.messager.send('');
        }
      }
    }
  );
};
