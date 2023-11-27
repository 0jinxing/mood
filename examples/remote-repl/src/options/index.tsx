import { MirrorSignal, createMirrorService, createPeerTransporter } from '@mood/remote';
import { useRef } from 'react';
import '../style.css';

export const Options = () => {
  const playerContainer = useRef<HTMLElement>();
  const service = useRef<ReturnType<typeof createMirrorService>>();

  const setup = (ref: HTMLElement | null) => {
    if (!ref) return;
    playerContainer.current = ref;
    service.current = createMirrorService({
      transporter: createPeerTransporter({
        host: 'localhost',
        port: 8080,
        id: 'remote-repl',
        role: 'mirror',
        path: '/myapp',
        key: 'peerjs',
        debug: 3
      })
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
