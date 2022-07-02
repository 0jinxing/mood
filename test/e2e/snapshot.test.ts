import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { browserTest, execExport } from '../utils/browser';
import { EleNode, NT, SNWithId } from '@mood/snapshot';

const SNAPSHOT_CODE_PATH = path.resolve('../packages/snapshot/dist/index.iife.js');

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

      const data = await execExport<SNWithId[]>(page, 'snapshot(document)');

      const images = data.filter(
        item => item.type === NT.ELE_NODE && item.tagName === 'IMG'
      ) as EleNode[];

      expect(images.length).eq(3);
      expect(images.map(item => item.attrs?.src)).to.deep.eq([
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
      const data = await execExport<SNWithId[]>(page, 'snapshot(document)');
      const images = data.filter(
        item => item.type === NT.ELE_NODE && item.tagName === 'IMG'
      ) as EleNode[];

      expect(images.map(item => item.attrs?.srcset)).to.deep.eq([
        '',
        'http://127.0.0.1:3030/1.png 1w, http://127.0.0.1:3030/a/b/c/1.png 2w, http://127.0.0.1:3030/a/c/d/e/1.png 2x'
      ]);
    }
  }
]);
