import path from "path";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import styles from "rollup-plugin-styles";

const genPackageConfig = (pkg) => {
  const plugins = [
    commonjs(),
    resolve(),
    styles(),
    typescript({ include: [/packages\/.*/] }),
  ];

  const input = path.resolve("packages", pkg, "index.ts");
  const name = "$$" + pkg;

  return [
    // browser
    {
      input,
      plugins,
      output: [
        {
          name,
          dir: path.resolve("dist", pkg),
          format: "iife",
          sourcemap: true,
        },
      ],
    },
    // commonjs
    {
      input,
      plugins,
      output: [
        {
          dir: path.resolve("dist/cjs", pkg),
          format: "cjs",
          sourcemap: true,
        },
      ],
    },
    // es module
    {
      input,
      plugins,
      output: [
        {
          dir: path.resolve("dist/es", pkg),
          format: "esm",
          sourcemap: true,
        },
      ],
    },
  ];
};

export default [...genPackageConfig("player"), ...genPackageConfig("record")];
