import { EmbedSignal, createEmbedService, createAgoraRTMTransporter } from '@mood/remote';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'create-embed-service') {
    const service = createEmbedService({
      transporter: createAgoraRTMTransporter(
        'f08688fcd3f046e08e5591721cf72f94',
        '007eJxTYPi5/Nw91wsHMr79MVN75p66he3Ukji5SPaMuzN4Hn7Q17qlwJBmYGFmYZGWnGKcZmBilmpgkWpqamlobmSYnGZulGZpEuO2O7UhkJHB7ZgnCyMDEwMjEIL43AxFqbn5Jam6RakFOQCOhyNP',
        'remote-repl',
        'embed'
      )
    });

    service.start();

    setTimeout(() => {
      service.send(EmbedSignal.READY);
    }, 1000);
  }
});
