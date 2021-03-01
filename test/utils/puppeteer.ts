import puppeteer from 'puppeteer';

export function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
}
