import { TEventWithTime } from '@mood/record';
import { createMachine, interpret } from '@xstate/fsm';

export type MachineContext = {
  events: TEventWithTime[];
  timeOffset: number;
  speed: number;
};

export type MachineEventType =
  | 'play'
  | 'pause'
  | 'resume'
  | 'end'
  | 'replay'
  | 'fast_forward'
  | 'back_to_normal';

export type MachineEvent = { type: MachineEventType };

export type MachineState =
  | 'inited'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'skipping';

export type MachineStates = Record<
  MachineState,
  {
    on: {
      [key in MachineEventType]?: MachineState;
    };
  }
>;

export function createReplayerService(context: MachineContext) {
  const states: MachineStates = {
    inited: { on: { play: 'playing' } },
    playing: {
      on: { pause: 'paused', end: 'ended', fast_forward: 'skipping' }
    },
    paused: { on: { resume: 'playing' } },
    skipping: { on: { back_to_normal: 'playing' } },
    ended: { on: { replay: 'playing' } }
  };

  const machine = createMachine<MachineContext, MachineEvent>({
    id: 'player',
    context,
    initial: 'inited',
    states
  });
  const service = interpret(machine);
  return service;
}
