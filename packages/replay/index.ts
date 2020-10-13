import { TEventWithTime } from '@mood/record';
import Player, { PlayerConfig } from './player';

function createPlayer(events: TEventWithTime[], config: PlayerConfig) {
  return new Player(events, config);
}

export default createPlayer;
