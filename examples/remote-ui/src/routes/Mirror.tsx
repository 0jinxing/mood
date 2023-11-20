import {
  MirrorSignal,
  Transporter,
  createLocalStorageTransporter,
  createMirrorService
} from '@mood/remote';
import { FC, useRef } from 'react';

const MirrorPage: FC = () => {
  const transporter = useRef<Transporter>(createLocalStorageTransporter());
  const service = useRef<ReturnType<typeof createMirrorService>>();

  const setup = (container: HTMLElement | null) => {
    if (!container) return;
    service.current = createMirrorService({
      transporter: transporter.current,
      playerConfig: {
        root: container
      }
    });
  };

  const handleStart = () => {
    service.current?.send(MirrorSignal.READY);
  };

  const handlePlay = () => {
    service.current?.machine.context.player?.play();
  };

  return (
    <div>
      MirrorPage player 👇
      <button onClick={handleStart}>START</button>
      <button onClick={handlePlay}>PLAY</button>
      <hr />
      <div ref={setup}></div>
      <iframe data-xstate width="100%" height="400px"></iframe>
    </div>
  );
};

export default MirrorPage;
