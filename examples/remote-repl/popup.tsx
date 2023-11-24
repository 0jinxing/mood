import { EmbedSignal, createEmbedService, createLocalStorageTransporter } from '@mood/remote';
import { useRef, useState } from 'react';

function IndexPopup() {
  const service = useRef<ReturnType<typeof createEmbedService>>();
  const [status, setStatus] = useState<string>();

  const handleInjectRemote = () => {
    service.current = createEmbedService({
      transporter: createLocalStorageTransporter(),
      doc: document
    });
    setStatus(service.current.state.value);
    service.current.subscribe(v => {
      setStatus(v.value);
    });
  };

  const handleMachineStart = () => {
    service.current?.start();
    service.current.send(EmbedSignal.READY);
  };

  return (
    <div>
      <a>{status}</a>
      <p onClick={handleInjectRemote}>inject</p>
      <p onClick={handleMachineStart}>start</p>
    </div>
  );
}

export default IndexPopup;
