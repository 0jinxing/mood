import { expect } from 'chai';
import { browserTest } from './utils/browser';

browserTest('test', [
  {
    message: '',
    fn: (server, browser) => {
      console.log(server, browser);
      expect(server).not.eq(null);
    }
  }
]);
