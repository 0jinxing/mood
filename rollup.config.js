import * as path from 'path';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  commonjs({ extensions: ['.js', '.ts'] }),
  typescript(),
  resolve({ browser: true }),
  postcss({ extract: true, minimize: true }),
  terser()
];

const packages = ['snapshot', 'record', 'replay'];

const packageConfig = packages.reduce((config, pkg) => {
  return [
    ...config,
    {
      input: path.resolve(`packages/${pkg}/index.ts`),
      plugins,
      output: [
        {
          name: pkg,
          file: path.resolve(`packages/${pkg}/dist/index.cjs.js`),
          format: 'cjs',
          sourcemap: true,
          exports: 'auto'
        },
        {
          name: pkg,
          file: path.resolve(`packages/${pkg}/dist/index.esm.js`),
          format: 'esm',
          sourcemap: true,
          exports: 'auto'
        },
        {
          name: pkg,
          file: path.resolve(`packages/${pkg}/dist/index.iife.js`),
          format: 'iife',
          sourcemap: true,
          exports: 'auto'
        }
      ]
    }
  ];
}, []);

const tracingConfig = [
  {
    input: path.resolve('tracing/src/index.ts'),
    plugins,
    output: [
      {
        name: 'tracing',
        file: path.resolve('tracing/dist/index.cjs.js'),
        format: 'cjs',
        sourcemap: true,
        exports: 'auto'
      },
      {
        name: 'tracing',
        file: path.resolve('tracing/dist/index.esm.js'),
        format: 'esm',
        sourcemap: true,
        exports: 'auto'
      },
      {
        name: 'tracing',
        file: path.resolve('tracing/dist/index.iife.js'),
        format: 'iife',
        sourcemap: true,
        exports: 'auto'
      }
    ]
  }
];

export default [...tracingConfig, ...packageConfig];
