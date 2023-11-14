import { createMachine, interpret } from 'xstate';
import { ClientBuffer, Messager, MessagerEventTypes, PeerMessager } from '../utils';
import { RecordEventWithTime } from '@mood/record';
import { Player, PlayerConfig } from '@mood/replay';

export enum ClientSignal {
  READY = 'READY',
  FIRST_RECORD = 'FIRST_RECORD',
  STOP = 'STOP',
  RESET = 'RESET'
}

export enum ClientStatus {
  IDLE = 'IDLE',
  WAITING_FIRST_RECORD = 'WAITING_FIRST_RECORD',
  CONNECTED = 'CONNECTED',
  STOPPED = 'STOPPED'
}

export type ClientContext = {
  messager: Messager;
  dispose?: Partial<Record<string, undefined | (() => void)>>;

  playerConfig?: Partial<PlayerConfig>;
};

export const createClientService = ({ messager, dispose, playerConfig }: ClientContext) => {
  const service = interpret(
    createMachine(
      {
        initial: 'idle',
        states: {
          [ClientStatus.IDLE]: {
            on: { [ClientSignal.READY]: { target: 'waiting_first_record' } }
          },

          [ClientStatus.WAITING_FIRST_RECORD]: {
            on: { [ClientSignal.FIRST_RECORD]: { target: 'connected' } }
          },

          [ClientStatus.CONNECTED]: {
            on: { [ClientSignal.STOP]: { target: 'stopped', actions: [ClientSignal.STOP] } }
          },

          [ClientStatus.STOPPED]: { on: { [ClientSignal.RESET]: { target: 'idle' } } }
        }
      },
      {
        actions: {
          [ClientSignal.STOP]() {}
        }
      }
    )
  );

  const current = service.getSnapshot();

  let player: Player;

  const buffer = new ClientBuffer<RecordEventWithTime>({
    onEmit(chunk) {
      player.pushEvent(chunk.data);
    }
  });

  messager.on(MessagerEventTypes.SOURCE_READY, () => {
    player = new Player([], { speed: 1, live: true, ...playerConfig });

    service.send(ClientSignal.READY);

    messager.send({ event: MessagerEventTypes.START });

    messager.on(MessagerEventTypes.ACK_CHUNK, id => buffer.delete(id));

    if (!current.matches(ClientStatus.CONNECTED)) {
      service.send(ClientSignal.FIRST_RECORD);
    }
  });
};
