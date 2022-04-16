import { RecordEventWithTime } from '@mood/record';
import { createPlayer, Player } from '@mood/replay';
import { FC, useEffect, useRef } from 'react';

export type MoodPlayerProps = {
  events: RecordEventWithTime[];
  onStatueChange?: () => void;
};

const MoodPlayer: FC<MoodPlayerProps> = props => {
  const player = useRef<Player>();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (player.current || !ref.current) return;

    player.current = createPlayer(props.events, { root: ref.current });
  });

  const handle = () => {
    player.current?.resume(100000);
  };

  const handlePlay = () => {
    player.current?.play();
  };

  const handlePause = () => {
    player.current?.pause();
  };

  return (
    <div className="player">
      <div
        className="inner"
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
        ref={ref}
      ></div>
      <button onClick={handlePlay}>play</button>
      <button onClick={handlePause}>pause</button>
      <button onClick={handle}>+</button>
    </div>
  );
};

export default MoodPlayer;
