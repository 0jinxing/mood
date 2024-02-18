import { EmbedSignal, createEmbedService, createAgoraRTMTransporter } from '@mood/remote';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'create-embed-service') {
    const resp = await fetch('https://remote-ui-token.172601673.workers.dev/embed-remote-repl');
    const { token, appId } = await resp.json();

    const service = createEmbedService({
      transporter: createAgoraRTMTransporter(appId, token, 'remote-repl', 'embed')
    });

    service.start();

    setTimeout(() => {
      service.send(EmbedSignal.READY);
    }, 1000);
  }
});
