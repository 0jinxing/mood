import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { getMimeType } from './mime';

export async function createServer(staticPath: string, port: number = 3000) {
  const server = http.createServer((req, res) => {
    const pathname = path.resolve(staticPath, (req.url || '').slice(1).trim());
    const { ext } = path.parse(pathname);

    try {
      const exists = fs.existsSync(pathname);
      if (!exists && !pathname) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const data = fs.readFileSync(pathname);

      res.setHeader('Content-type', getMimeType(ext.slice(1)));
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-type');
      res.end(data);
    } catch {
      res.statusCode = 502;
      res.end();
    }
  });

  await new Promise((resolve, reject) => {
    server.listen(port).on('listening', resolve).on('error', reject);
  });

  return server;
}
