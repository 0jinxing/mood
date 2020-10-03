import * as path from 'path';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript(),
  postcss({ extract: true, minimize: true }),
  terser()
];

const packages = ['record', 'replay', 'snapshot'];

const config = packages.reduce((config, pkg) => {
  return [
    ...config,
    {
      input: path.resolve(`packages/${pkg}/index.ts`),
      plugins,
      output: [
        {
          name: pkg,
          file: path.resolve(`packages/${pkg}/dist/cjs/index.js`),
          format: 'cjs',
          sourcemap: true
        },
        {
          name: pkg,
          file: path.resolve(`packages/${pkg}/dist/esm/index.js`),
          format: 'esm',
          sourcemap: true
        },
        {
          name: pkg,
          file: path.resolve(`packages/${pkg}/dist/iife/index.js`),
          format: 'iife',
          sourcemap: true
        }
      ]
    }
  ];
}, []);

export default config;
