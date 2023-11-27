import { EmbedSignal, createEmbedService, createPeerTransporter } from '@mood/remote';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'create-embed-service') {
    const service = createEmbedService({
      transporter: createPeerTransporter({
        host: 'localhost',
        port: 8080,
        id: 'remote-repl',
        role: 'embed',
        path: '/myapp',
        key: 'peerjs',
        debug: 3
      })
    });

    service.start();

    setTimeout(() => {
      service.send(EmbedSignal.READY);
    }, 1000);
  }
});
