import { createMachine, interpret } from '@xstate/fsm';

import { ReplayerEvent, ReplayerStates } from './types';
import type { ReplayerContext } from './types';

export function createReplayerService(context: ReplayerContext) {
  const states: ReplayerStates = {
    inited: { on: { play: 'playing' } },
    playing: {
      on: { pause: 'paused', end: 'ended', fast_forward: 'skipping' }
    },
    paused: { on: { resume: 'playing' } },
    skipping: { on: { back_to_normal: 'playing' } },
    ended: { on: { replay: 'playing' } }
  };

  const machine = createMachine<ReplayerContext, ReplayerEvent>({
    id: 'player',
    context,
    initial: 'inited',
    states
  });
  const service = interpret(machine);
  return service;
}
