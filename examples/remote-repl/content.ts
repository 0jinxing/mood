import type { createEmbedService } from '@mood/remote';
import chalk from 'chalk';

export {};

export function setup() {
  let machine: null | ReturnType<typeof createEmbedService> = null;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(chalk.green('onMessage'), message);
  });
}

setup();
