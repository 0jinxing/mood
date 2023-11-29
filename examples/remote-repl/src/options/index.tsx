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
        '007eJxTYDic+Ijz2rVbpZqJH1JeOC+fWTDt94wc7QWJIceDZAw0b8gpMKQZWJhZWKQlpxinGZiYpRpYpJqaWhqaGxkmp5kbpVmaaM5LS20IZGTYtGM/EyMDEwMjEIL4Qgy5mUVF+UW6Ram5+SWpQKogBwBKLyXC',
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
