import { createEmbedService, createLocalStorageTransporter, EmbedSignal } from '@mood/remote';

import { FC, useEffect, useRef } from 'react';

const EmbedPage: FC = () => {
  const embed = useRef<ReturnType<typeof createEmbedService>>();

  useEffect(() => {
    embed.current = createEmbedService({ transporter: createLocalStorageTransporter() });
    embed.current.start();
  }, []);

  const handleStart = () => {
    embed.current?.send(EmbedSignal.READY);
  };

  return (
    <div>
      EmbedPage
      <button onClick={handleStart}>READY</button>
      <hr />
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam molestiae nemo totam.
        Possimus impedit optio ad quas commodi repudiandae eaque qui hic fugiat quidem? Quaerat
        nesciunt deleniti nisi esse quisquam.
      </div>
      <input></input>
      <input type="checkbox" />
      <br />
      <iframe data-xstate width="100%" height="400px" />
    </div>
  );
};

export default EmbedPage;
