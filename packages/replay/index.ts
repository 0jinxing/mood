import { TEventWithTime } from '@mood/record';
import { Player, PlayerConfig } from './player';

export function replay(
  events: TEventWithTime[],
  config: Partial<PlayerConfig> = {}
) {
  return new Player(events, config);
}
