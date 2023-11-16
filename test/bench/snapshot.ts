import * as fs from 'fs';
import * as path from 'path';
import bench from '@stdlib/bench';
import { launchBrowser } from '../utils/browser';

function getCode() {
  const fullPath = path.resolve('../packages/snapshot/dist/index.iife.js');
  return fs.readFileSync(fullPath, 'utf-8');
}

bench('snapshot', async b => {
  const browser = await launchBrowser();

  const page = await browser.newPage();
  await page.goto('https://github.com/0jinxing/mood', { waitUntil: 'domcontentloaded' });
  await page.evaluate(getCode());

  b.tic();
  for (let i = 0; i < b.iterations; i++) {
    await page.evaluate('snapshot(document)');
  }
  b.toc();
  b.end();
  browser.close();
});
