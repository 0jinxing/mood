import * as http from 'http';
import { Browser, Page } from 'puppeteer';
import { createServer } from './server';
import { launchBrowser } from './puppeteer';

export function browserTest(
  message: string,
  test: Array<{
    message: string;
    fn: (browser: Browser, server: http.Server) => void | Promise<void>;
  }> = []
) {
  describe(message, function () {
    let server: http.Server;
    let browser: Browser;

    before(async function () {
      server = await createServer('html', 3030);
      browser = await launchBrowser();
    });

    for (const { message, fn } of test) {
      it(message, () => fn(browser, server));
    }

    after(async function () {
      this.timeout(100_000);
      await new Promise<void>((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve()))
      );

      const pages = await browser.pages();
      await Promise.all(pages.map(page => page.close()));

      await browser.close();
    });
  });
}

export function execExport<T>(page: Page, code: string) {
  return new Promise<T[]>(resolve => {
    page
      .exposeFunction('__EXPORT', handler)
      .then(() => page.evaluate(`__EXPORT(${code})`));
    function handler(...data: any[]) {
      resolve(data);
    }
  });
}
