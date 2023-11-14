import { assign, createMachine, interpret } from 'xstate';
import { EmbedBuffer, Messager, MessagerEventTypes } from '../utils';
import { RecordEventWithTime, record } from '@mood/record';

export enum EmbedSignal {
  START = 'START',
  CONNECT = 'CONNECT',
  STOP = 'STOP'
}

export enum EmbedStatus {
  IDLE = 'IDLE',
  READY = 'READY',
  CONNECTED = 'CONNECTED'
}

export type EmbedContext = {
  messager: Messager;
  dispose?: Partial<Record<string, undefined | (() => void)>>;
};

export const createEmbedService = (context: EmbedContext) => {
  const messager = context.messager;

  const buffer = new EmbedBuffer<RecordEventWithTime>({
    onTimeout(data) {
      messager.send({ event: MessagerEventTypes.SEND_CHUNK, payload: data });
    }
  });

  const service = interpret(
    createMachine(
      {
        context,
        initial: 'idle',
        states: {
          [EmbedStatus.IDLE]: {
            on: {
              [EmbedSignal.START]: {
                target: EmbedStatus.READY,
                actions: [EmbedSignal.START]
              }
            }
          },
          [EmbedStatus.READY]: {
            on: {
              [EmbedSignal.CONNECT]: {
                target: EmbedStatus.CONNECTED,
                actions: [EmbedSignal.CONNECT]
              }
            }
          },
          [EmbedStatus.CONNECTED]: {
            on: {
              [EmbedSignal.STOP]: { target: EmbedStatus.IDLE, actions: [EmbedSignal.STOP] }
            }
          }
        }
      },

      {
        actions: {
          [EmbedSignal.START]() {},

          [EmbedSignal.CONNECT]: assign(({ messager, dispose }) => {
            dispose?.['connect']?.();

            const stop = record({
              emit(e) {
                const id = buffer.add(e);
                messager.send({ event: MessagerEventTypes.SEND_CHUNK, payload: buffer.model[id] });
              }
            });
            return { messager, dispose: { ...dispose, connect: stop } };
          }),

          [EmbedSignal.STOP]({ messager, dispose }) {
            dispose?.['connect']?.();
            messager.dispose();
            buffer.reset();
          }
        }
      }
    )
  );

  messager.on(MessagerEventTypes.ACK_CHUNK, chunk => {});

  return service;
};
