import path from 'path';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import glob from 'glob';

import { terser } from 'rollup-plugin-terser';

const plugins = [
  resolve({ browser: true, extensions: ['.js', '.ts'] }),
  commonjs({ extensions: ['.js', '.ts'] }),
  typescript(),
  terser()
];

const packages = glob.sync('packages/*').map(p => {
  return {
    input: path.resolve(`${p}/index.ts`),
    plugins,
    output: [
      { file: path.resolve(`${p}/dist/index.js`), format: 'cjs', sourcemap: true },
      { file: path.resolve(`${p}/dist/index.es.js`), format: 'esm', sourcemap: true },
      {
        name: 'window',
        file: path.resolve(`${p}/dist/index.iife.js`),
        format: 'iife',
        sourcemap: true,
        extend: true
      }
    ]
  };
});

export default packages;
