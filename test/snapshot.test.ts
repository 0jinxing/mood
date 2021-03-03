import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { ElementNode, NT, SNWithId } from '@mood/snapshot';
import { browserTest, execExport } from './utils/browser';

const SNAPSHOT_CODE_PATH = path.resolve(
  '../packages/snapshot/dist/index.iife.js'
);
function getCode() {
  const code = fs.readFileSync(SNAPSHOT_CODE_PATH, 'utf-8');
  return code;
}

browserTest('snapshot', [
  {
    message: 'should handle img src url',
    fn: async browser => {
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:3030/img-src.html', {
        waitUntil: 'domcontentloaded'
      });

      await page.evaluate(getCode());

      const [data] = await execExport<SNWithId[]>(page, 'snapshot(document)');

      const images = data.filter(
        item => item.type === NT.ELEMENT_NODE && item.tagName === 'IMG'
      ) as ElementNode[];

      expect(images.length).eq(3);
      expect(images.map(item => item.attributes.src)).to.deep.eq([
        'http://127.0.0.1:3030/a/b/c/d/e/1.png',
        'http://127.0.0.1:3030/a/1.png',
        'http://127.0.0.1:3030/1.png'
      ]);
    }
  },
  {
    message: 'should handle img srcset url',
    fn: async browser => {
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:3030/img-srcset.html', {
        waitUntil: 'domcontentloaded'
      });

      await page.evaluate(getCode());
      const [data] = await execExport<SNWithId[]>(page, 'snapshot(document)');
      const images = data.filter(
        item => item.type === NT.ELEMENT_NODE && item.tagName === 'IMG'
      ) as ElementNode[];

      expect(images.map(item => item.attributes.srcset)).to.deep.eq([
        '',
        'http://127.0.0.1:3030/1.png 1w, http://127.0.0.1:3030/a/b/c/1.png 2w, http://127.0.0.1:3030/a/c/d/e/1.png 2x'
      ]);
    }
  }
]);
