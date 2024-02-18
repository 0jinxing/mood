import { assign, createMachine, interpret } from '@xstate/fsm';
import { MirrorBuffer, Transporter, TransporterEventTypes, PeerTransporter } from '../utils';
import { RecordEventWithTime } from '@mood/record';
import { Player, PlayerConfig } from '@mood/replay';
import { onDispatch } from './observe';

export enum MirrorSignal {
  READY = 'READY',
  STOP = 'STOP',
  RESET = 'RESET'
}

export enum MirrorStatus {
  IDLE = 'IDLE',
  CONNECTED = 'CONNECTED',
  STOPPED = 'STOPPED'
}

export type MirrorContext = {
  transporter: Transporter;
  dispose?: Partial<Record<string, undefined | (() => void)>>;
  player?: Player;

  playerConfig: PlayerConfig;
};

export const createMirrorService = (context: Exclude<MirrorContext, 'player'>) => {
  const player: Player = new Player([], { ...context.playerConfig, live: true });

  const buffer = new MirrorBuffer<RecordEventWithTime>({
    onEmit(chunk) {
      player.pushEvent(chunk.data);
    }
  });

  const service = interpret(
    createMachine(
      {
        context: { ...context, player },
        initial: MirrorStatus.IDLE,
        states: {
          [MirrorStatus.IDLE]: {
            on: {
              [MirrorSignal.READY]: {
                target: MirrorStatus.CONNECTED,
                actions: [MirrorSignal.READY]
              }
            }
          },

          [MirrorStatus.CONNECTED]: {
            on: {
              [MirrorSignal.STOP]: { target: MirrorStatus.STOPPED, actions: [MirrorSignal.STOP] }
            }
          },

          [MirrorStatus.STOPPED]: { on: { [MirrorSignal.RESET]: { target: MirrorStatus.IDLE } } }
        }
      },
      {
        actions: {
          [MirrorSignal.READY]: assign(context => {
            context.transporter.send({
              event: TransporterEventTypes.REQUEST_CONNECTION,
              id: buffer.cursor
            });

            const removeListener = context.transporter.on(
              TransporterEventTypes.CONNECTION_ACCEPT,
              () => {
                removeListener();
                service.send(MirrorSignal.READY);
                player.play();

                setTimeout(() => {
                  onDispatch(context.playerConfig.mirror, player.iframe.contentDocument!, event => {
                    context.transporter.send({
                      event: TransporterEventTypes.DISPATCH,
                      payload: event
                    });
                  });
                }, 1000);

                context.transporter.on(TransporterEventTypes.SEND, ({ payload }) => {
                  const sort = Array.isArray(payload) ? payload : [payload];

                  buffer.add(sort);

                  const ids = sort.filter(c => c.id >= buffer.cursor - 1).map(c => c.id);

                  if (ids.length > 0) {
                    context.transporter.send({
                      event: TransporterEventTypes.ACK,
                      ids
                    });
                  }
                });
              }
            );

            return {
              ...context,
              dispose: { ...context.dispose, [MirrorSignal.READY]: removeListener }
            };
          }),
          [MirrorSignal.STOP]() {}
        }
      }
    )
  );

  return service;
};
