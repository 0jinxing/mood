import { assign, createMachine, interpret } from '@xstate/fsm';
import { MirrorBuffer, Transporter, TransporterEventTypes, PeerTransporter } from '../utils';
import { RecordEventWithTime } from '@mood/record';
import { Player, PlayerConfig } from '@mood/replay';

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

  playerConfig?: Partial<PlayerConfig>;
};

export const createMirrorService = (context: Exclude<MirrorContext, 'player'>) => {
  const player: Player = new Player([], { speed: 1, ...context.playerConfig, live: true });

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
            context.transporter.send({ event: TransporterEventTypes.MIRROR_READY });

            const removeListener = context.transporter.on(
              TransporterEventTypes.SOURCE_READY,
              () => {
                removeListener();
                service.send(MirrorSignal.READY);
                context.transporter.on(TransporterEventTypes.SEND_CHUNK, e => {
                  buffer.add(e.chunk);
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
