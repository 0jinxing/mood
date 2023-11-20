import { createMachine, interpret } from 'xstate';
import { ClientBuffer, Transporter, TransporterEventTypes, PeerTransporter } from '../utils';
import { RecordEventWithTime } from '@mood/record';
import { Player, PlayerConfig } from '@mood/replay';
import { inspect } from '@xstate/inspect';

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

const { IDLE, CONNECTED, STOPPED } = MirrorStatus;
const { READY, STOP, RESET } = MirrorSignal;

export const createMirrorService = (context: Exclude<MirrorContext, 'player'>) => {
  const player: Player = new Player([], { speed: 1, ...context.playerConfig, live: true });

  const service = interpret(
    createMachine(
      {
        context: { ...context, player },
        initial: IDLE,
        states: {
          [IDLE]: {
            on: { [READY]: { target: CONNECTED, actions: [READY] } }
          },

          [CONNECTED]: {
            on: { [STOP]: { target: STOPPED, actions: [STOP] } }
          },

          [STOPPED]: { on: { [RESET]: { target: IDLE } } }
        }
      },
      {
        actions: {
          [READY]() {
            context.transporter.send({ event: TransporterEventTypes.MIRROR_READY });
          },
          [STOP]() {}
        }
      }
    ),
    { devTools: true }
  );

  const buffer = new ClientBuffer<RecordEventWithTime>({
    onEmit(chunk) {
      player.pushEvent(chunk.data);
    }
  });

  context.transporter.on(TransporterEventTypes.SOURCE_READY, () => {
    service.send(READY);
    context.transporter.on(TransporterEventTypes.SEND_CHUNK, e => {
      buffer.add(e.chunk.data);
    });
  });

  service.start();

  inspect();

  return service;
};
