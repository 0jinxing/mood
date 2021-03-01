import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { getMimeType } from './mime';

export async function createServer(staticPath: string, port: number = 3000) {
  const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url);
    const { ext } = path.parse(pathname);

    const data = fs.readFileSync(path.resolve(staticPath, pathname));

    res.setHeader('Content-type', getMimeType[ext.slice(1)]);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type');

    res.end(data);
  });

  await new Promise((resolve, reject) => {
    server.listen(port).on('listening', resolve).on('error', reject);
  });

  return server;
}
