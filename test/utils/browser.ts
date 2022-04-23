import * as http from 'http';
import { Browser, Page, chromium } from '@playwright/test';
import { createServer } from './server';

export function launchBrowser() {
  return chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });
}

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

      await browser.close();
    });
  });
}

export function execExport<T>(page: Page, code: string) {
  return new Promise<T>(async resolve => {
    await page.exposeFunction('__EXPORT', resolve);
    await page.evaluate(`__EXPORT(${code})`);
  });
}
