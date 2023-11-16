import esbuild from 'esbuild';
import path from 'path';
import glob from 'glob';

const packages = glob.sync('packages/*');
const formats = ['esm', 'cjs', 'iife'] as const;

async function build(pkg: string, format: typeof formats[number]) {
  await esbuild.build({
    platform: 'browser',
    entryPoints: [path.resolve(`./${pkg}/index.ts`)],
    outfile: path.resolve(`./${pkg}/dist/index.${format}.js`),
    tsconfig: path.resolve(`./${pkg}/tsconfig.json`),
    bundle: true,
    sourcemap: true,
    format
  });
}

async function main() {
  await Promise.all(packages.map(pkg => formats.map(format => build(pkg, format))).flat());
}

main();
