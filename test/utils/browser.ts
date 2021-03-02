import * as http from 'http';
import { Browser } from 'puppeteer';
import { createServer } from './server';
import { launchBrowser } from './puppeteer';

export function browserTest(
  message: string,
  test: Array<{
    message: string;
    fn: (server: http.Server, browser: Browser) => void;
  }> = []
) {
  describe(message, () => {
    let server: http.Server;
    let browser: Browser;

    before(async () => {
      server = await createServer('html', 3030);
      browser = await launchBrowser();
    });

    test.forEach(({ message, fn }) => {
      it(message, () => fn(server, browser));
    });

    after(async () => {
      await new Promise<void>((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()));
      });

      const pages = await browser.pages();
      await Promise.all(pages.map(page => page.close()));
      await browser.close();
    });
  });
}
