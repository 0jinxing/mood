import 'mocha';
import { Server } from 'http';
import { Browser } from 'puppeteer';
import { createServer } from './server';
import { launchBrowser } from './puppeteer';

export function browserTest(
  title: string,
  func: (server: Server, browser: Browser) => void
) {
  describe(title, () => {
    let server: Server;
    let browser: Browser;

    before(async () => {
      server = await createServer('html', 3030);
      browser = await launchBrowser();
    });

    func(server, browser);

    after(async () => {
      server.close();
      browser.close();
    });
  });
}
