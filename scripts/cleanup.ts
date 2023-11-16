import path from 'path';
import fs from 'fs';
import pkgs from './pkgs';

async function cleanup(pkg: string) {
  const dist = path.resolve(pkg, 'dist');
  if (fs.existsSync(dist)) {
    fs.rmdirSync(dist, { recursive: true });
  }
}

pkgs.forEach(cleanup);
