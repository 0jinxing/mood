import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import styles from "rollup-plugin-styles";

export default [
  {
    input: "packages/common/index.ts",
    plugins: [typescript(), styles(), commonjs(), resolve()],
    output: [
      {
        file: "dist/bundle.js",
        format: "iife",
        sourcemap: true,
      },
    ],
  },
];
