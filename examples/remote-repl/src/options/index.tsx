import { MirrorSignal, createMirrorService, createAgoraRTMTransporter } from '@mood/remote';
import { useRef } from 'react';
import '../style.css';
import { Mirror } from '@mood/snapshot';

export const Options = () => {
  const playerContainer = useRef<HTMLElement>();
  const service = useRef<ReturnType<typeof createMirrorService>>();

  const setup = async (ref: HTMLElement | null) => {
    if (!ref) return;
    playerContainer.current = ref;
    const resp = await fetch('https://remote-ui-token.172601673.workers.dev/mirror-remote-repl');
    const { token, appId } = await resp.json();

    service.current = createMirrorService({
      playerConfig: {
        speed: 1,
        container: playerContainer.current,
        interact: true,
        mirror: new Mirror()
      },
      transporter: createAgoraRTMTransporter(appId, token, 'remote-repl', 'mirror')
    });
    service.current.start();
  };

  const handleReady = () => {
    service.current?.send(MirrorSignal.READY);
  };

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-gap-2 plasmo-p-4">
      <button onClick={handleReady} className="plasmo-btn plasmo-btn-sm">
        整
      </button>
      <br />
      <div
        className={
          'plasmo-shadow plasmo-w-full plasmo-min-h-[200px] plasmo-rounded-lg plasmo-bg-slate-100'
        }
        ref={setup}
      ></div>
    </div>
  );
};

export default Options;
