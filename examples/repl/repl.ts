import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { chromium } from '@playwright/test';

function getCode(): string {
  const bundlePath = path.resolve('../../packages/record/dist', 'index.iife.js');
  return fs.readFileSync(bundlePath, 'utf8');
}

(async () => {
  const code = getCode();
  let events: unknown[];

  start();

  async function start() {
    events = [];
    const { url } = await inquirer.prompt<{ url: string }>([
      {
        type: 'input',
        name: 'url',
        message:
          'Enter the url you want to record, e.g https://g2.antv.antgroup.com/examples/general/interval/#bar-basic: ',
        default: 'https://g2.antv.antgroup.com/examples/general/interval/#bar-basic'
      }
    ]);

    console.log(`Going to open ${url}...`);
    await record(url);
    console.log('Ready to record. You can do any interaction on the page.');

    const { shouldStore } = await inquirer.prompt<{ shouldStore: boolean }>([
      {
        type: 'confirm',
        name: 'shouldStore',
        message: 'Persistently store these recorded events?'
      }
    ]);

    if (shouldStore) {
      saveEvents();
    }

    const { shouldRecordAnother } = await inquirer.prompt<{
      shouldRecordAnother: boolean;
    }>([
      {
        type: 'confirm',
        name: 'shouldRecordAnother',
        message: 'Record another one?'
      }
    ]);

    if (shouldRecordAnother) {
      start();
    } else {
      process.exit();
    }
  }

  async function record(url: string) {
    const browser = await chromium.launch({
      headless: false,
      devtools: true,
      args: ['--start-maximized']
    });

    const page = await browser.newPage({ viewport: null });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.exposeFunction('_replLog', (event: unknown) => events.push(event));

    await page.evaluate(`;${code}
      window.__IS_RECORDING__ = true
      $$mood.record({
        emit: event => window._replLog(event)
      });
     `);

    page.on('framenavigated', async () => {
      const isRecording = await page.evaluate('window.__IS_RECORDING__');
      if (!isRecording) {
        await page.evaluate(`;${code}
          window.__IS_RECORDING__ = true
          $$mood.record({
            emit: event => window._replLog(event)
          });
        `);
      }
    });
  }

  function saveEvents() {
    const tempFolder = path.resolve('dist');
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder);
    }
    const time = new Date().toISOString().replace(/[-|:]/g, '_').replace(/\..+/, '');
    const fileName = `replay_${time}.html`;
    const content = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Record @${time}</title>
          <link rel="stylesheet" href="../../../packages/replay/styles/index.css" />
        </head>
        <body>
          <script src="../../../packages/replay/dist/index.iife.js"></script>
          <script>
            /*<!--*/
            const events = ${JSON.stringify(events).replace(/<\/script>/g, '<\\/script>')};
            /*-->*/
            const replayer = $$mood.createPlayer(events);
            replayer.play();
          </script>
        </body>
      </html>
    `;
    const savePath = path.resolve(tempFolder, fileName);
    fs.writeFileSync(savePath, content);
    console.log(`Saved at ${savePath}`);
  }

  process
    .on('uncaughtException', error => {
      console.error(error);
    })
    .on('unhandledRejection', error => {
      console.error(error);
    });
})();
