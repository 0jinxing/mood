import { assign, createMachine, interpret } from 'xstate';
import { EmbedBuffer, Transporter, TransporterEventTypes } from '../utils';
import { RecordEventWithTime, record } from '@mood/record';
import { inspect } from '@xstate/inspect';

export enum EmbedSignal {
  READY = 'READY',
  CONNECT = 'CONNECT',
  STOP = 'STOP'
}

export enum EmbedStatus {
  IDLE = 'IDLE',
  CONNECTION = 'CONNECTION',
  CONNECTED = 'CONNECTED'
}

export type EmbedContext = {
  transporter: Transporter;
  dispose?: Partial<Record<string, () => void>>;
};

export const createEmbedService = (context: EmbedContext) => {
  const transporter = context.transporter;

  const buffer = new EmbedBuffer<RecordEventWithTime>({
    onTimeout(data) {
      transporter.send({ event: TransporterEventTypes.SEND_CHUNK, chunk: data });
    }
  });

  const { IDLE, CONNECTION, CONNECTED } = EmbedStatus;
  const { READY, CONNECT, STOP } = EmbedSignal;

  const service = interpret(
    createMachine(
      {
        context,
        initial: IDLE,
        states: {
          [IDLE]: {
            on: {
              [READY]: {
                target: CONNECTION,
                actions: [READY]
              }
            }
          },
          [CONNECTION]: {
            on: {
              [CONNECT]: {
                target: CONNECTED,
                actions: [CONNECT]
              }
            }
          },
          [CONNECTED]: {
            on: {
              [STOP]: { target: IDLE, actions: [STOP] }
            }
          }
        }
      },

      {
        actions: {
          [READY]() {
            const off = transporter.on(TransporterEventTypes.MIRROR_READY, () => {
              transporter.send({ event: TransporterEventTypes.SOURCE_READY });
              service.send(EmbedSignal.CONNECT);
              off();
            });
          },

          [CONNECT]: assign(({ transporter, dispose }) => {
            dispose?.['connect']?.();
            const stopRecord = record({
              emit(e) {
                const id = buffer.add(e);
                transporter.send({
                  event: TransporterEventTypes.SEND_CHUNK,
                  chunk: buffer.model[id]
                });
              }
            });
            return { transporter, dispose: { ...dispose, connect: stopRecord } };
          }),

          [STOP]({ transporter, dispose }) {
            dispose?.['connect']?.();
            transporter.dispose();
            buffer.reset();
          }
        }
      }
    ),
    { devTools: true }
  );

  service.start();

  transporter.on(TransporterEventTypes.ACK_CHUNK, e => buffer.delete(e.id));

  inspect();

  return service;
};
