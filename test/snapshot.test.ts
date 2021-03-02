import { expect } from 'chai';
import { browserTest } from './utils/browser';

browserTest('test', [
  {
    message: '',
    fn: (server, browser) => {
      expect(server).not.eq(null);
    }
  }
]);
