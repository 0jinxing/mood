import { EmbedSignal, createEmbedService, createAgoraRTMTransporter } from '@mood/remote';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'create-embed-service') {
    const service = createEmbedService({
      transporter: createAgoraRTMTransporter(
        '2b6ebe7258ae455ab7911fe7f247b026',
        '007eJxTYFhnnnMkbssa883BH7cbLrVyenjsRYG8db2G8MNvlu9OBVooMKQZWJhZWKQlpxinGZiYpRpYpJqaWhqaGxkmp5kbpVmaBM1LS20IZGSweiTPwsjAxMAIhCC+IENqblJqim5Ram5+SSqQKsgBAPgOJHI=',
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
