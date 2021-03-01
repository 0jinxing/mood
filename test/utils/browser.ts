import * as http from 'http';
import { Browser } from 'puppeteer';
import { createServer } from './server';
import { launchBrowser } from './puppeteer';

export function browserTest(
  message: string,
  caseList: Array<{
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

    caseList.forEach(({ message, fn }) => {
      it(message, () => fn(server, browser));
    });

    after(async () => {
      server.close();
      browser.close();
    });
  });
}
