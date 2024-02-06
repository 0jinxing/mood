export async function pipeThroughWorker<
  W extends Worker,
  R = W['onmessage'] extends Function ? Parameters<W['onmessage']>[0]['data'] : never
>(worker: W, msg: Parameters<W['postMessage']>[0]): Promise<R> {
  const result = await new Promise<R>((resolve, reject) => {
    worker.onerror = event => reject(event.error);
    worker.onmessageerror = event => reject(event);

    worker.onmessage = event => resolve(event.data);
    worker.postMessage(msg);
  });

  worker.terminate();

  return result;
}

export type WorkerRet = Worker['onmessage'] extends Function
  ? Parameters<Worker['onmessage']>[0]['data']
  : never;
