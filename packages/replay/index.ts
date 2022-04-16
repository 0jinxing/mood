import { RecordEventWithTime } from '@mood/record';
import { Player, PlayerConfig } from './model/player';

export function replay(
  events: RecordEventWithTime[],
  config: Partial<PlayerConfig> = {}
) {
  return new Player(events, config);
}
