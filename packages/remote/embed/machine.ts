import { assign, createMachine, interpret } from '@xstate/fsm';
import { EmbedBuffer, Transporter, TransporterEventTypes } from '../utils';
import { RecordEventWithTime, record } from '@mood/record';

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
  doc?: Document;
};

export const createEmbedService = (context: EmbedContext) => {
  const transporter = context.transporter;

  const buffer = new EmbedBuffer<RecordEventWithTime>({
    onTimeout(data) {
      transporter.send({ event: TransporterEventTypes.SEND, payload: data });
    }
  });

  const service = interpret(
    createMachine(
      {
        context,
        initial: EmbedStatus.IDLE,
        states: {
          [EmbedStatus.IDLE]: {
            on: {
              [EmbedSignal.READY]: {
                target: EmbedStatus.CONNECTION,
                actions: [EmbedSignal.READY]
              }
            }
          },
          [EmbedStatus.CONNECTION]: {
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
          [EmbedSignal.READY]: assign(({ transporter, dispose }) => {
            dispose?.[EmbedSignal.READY]?.();

            console.log('EmbedSignal.READY');

            const removeListener = transporter.on(
              TransporterEventTypes.REQUEST_CONNECTION,
              ({ id }) => {
                if (buffer.model[id] || buffer.cursor <= id) {
                  transporter.send({
                    event: TransporterEventTypes.CONNECTION_ACCEPT,
                    id: buffer.cursor
                  });
                  service.send(EmbedSignal.CONNECT);
                } else {
                  transporter.send({ event: TransporterEventTypes.CONNECTION_REJECTED });
                }
                removeListener();
              }
            );

            return {
              transporter,
              dispose: { ...dispose, [EmbedSignal.READY]: removeListener }
            };
          }),

          [EmbedSignal.CONNECT]: assign(({ transporter, dispose }) => {
            dispose?.[EmbedSignal.CONNECT]?.();
            const stopRecord = record({
              emit(e) {
                const chunk = buffer.model[buffer.add(e) - 1];
                transporter.send({ event: TransporterEventTypes.SEND, payload: chunk });
              }
            });
            return { transporter, dispose: { ...dispose, [EmbedSignal.CONNECT]: stopRecord } };
          }),

          [EmbedSignal.STOP]({ transporter, dispose }) {
            dispose?.[EmbedSignal.READY]?.();
            dispose?.[EmbedSignal.CONNECT]?.();

            transporter.dispose();
            buffer.reset();
          }
        }
      }
    )
  );

  transporter.on(TransporterEventTypes.ACK, ({ ids }) => {
    ids.forEach(id => buffer.delete(id));
  });

  return service;
};
