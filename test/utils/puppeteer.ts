import puppeteer from 'puppeteer';

export function launch() {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
}
