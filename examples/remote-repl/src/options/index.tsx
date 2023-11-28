import { MirrorSignal, createMirrorService, createAgoraRTMTransporter } from '@mood/remote';
import { useRef } from 'react';
import '../style.css';

export const Options = () => {
  const playerContainer = useRef<HTMLElement>();
  const service = useRef<ReturnType<typeof createMirrorService>>();

  const setup = (ref: HTMLElement | null) => {
    if (!ref) return;
    playerContainer.current = ref;
    service.current = createMirrorService({
      transporter: createAgoraRTMTransporter(
        '2b6ebe7258ae455ab7911fe7f247b026',
        '007eJxTYHjst13cdtkFRs0Mvxn66htkpmf/WNr8POH731vT1r1v+WOrwJBmYGFmYZGWnGKcZmBilmpgkWpqamlobmSYnGZulGZpstA7NbUhkJFBudaNmZGBiYERCEF8IYbczKKi/CLdotTc/JJUIFWQAwBPhCW7',
        'remote-repl',
        'mirror'
      )
    });

    service.current.start();
  };

  const handleReady = () => {
    service.current?.send(MirrorSignal.READY);
  };

  return (
    <div>
      <button onClick={handleReady} className="plasmo-btn plasmo-btn-primary">
        READY
      </button>
      <br />
      <div ref={setup}></div>
    </div>
  );
};

export default Options;
