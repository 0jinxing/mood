import esbuild, { Plugin } from 'esbuild';

export function inlineWorker() {
  const ret: Plugin = {
    name: 'esbuild-plugin-inline-worker',

    setup(build) {
      build.onLoad({ filter: /\.worker\.(js|jsx|ts|tsx)$/ }, async ({ path: workerPath }) => {
        const workerCode = await buildWorker(workerPath);
        const contents = `
        import inlineWorker from '__inline-worker'
export default function Worker() {
  return inlineWorker(${JSON.stringify(workerCode)});
}`.trim();

        return { contents, loader: 'js' };
      });

      const inlineWorkerFunctionCode = `
export default function inlineWorker(scriptText) {
  const blob = new Blob([scriptText], {type: 'text/javascript'});
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
`.trim();

      build.onResolve({ filter: /^__inline-worker$/ }, ({ path }) => {
        return { path, namespace: 'inline-worker' };
      });
      build.onLoad({ filter: /.*/, namespace: 'inline-worker' }, () => {
        return { contents: inlineWorkerFunctionCode, loader: 'js' };
      });
    }
  };

  return ret;
}

async function buildWorker(workerPath: string) {
  const result = await esbuild.build({
    write: false,
    bundle: true,
    format: 'esm',
    entryPoints: [workerPath]
  });

  return result.outputFiles[0].text;
}
