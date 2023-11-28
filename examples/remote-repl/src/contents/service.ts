import { EmbedSignal, createEmbedService, createAgoraRTMTransporter } from '@mood/remote';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'create-embed-service') {
    const service = createEmbedService({
      transporter: createAgoraRTMTransporter(
        '2b6ebe7258ae455ab7911fe7f247b026',
        '007eJxTYMj8n+g9V+VD5cNrM1auXWTZu5Lp29TZbXwrJJv4K93m7LBSYEgzsDCzsEhLTjFOMzAxSzWwSDU1tTQ0NzJMTjM3SrM0YfBJTW0IZGSYcPUKMyMDEwMjEIL4ggypuUmpKbpFqbn5JalAqiAHAAPPJKs=',
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
