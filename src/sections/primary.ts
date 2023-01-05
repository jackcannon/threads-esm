import { Worker, WorkerOptions } from 'node:worker_threads';
import { getDeferred } from 'swiss-ak';
import { MsgListFunctions, MsgResult, MsgTrigger, SpawnPromiseObject } from './types.js';

export const spawn = async <T extends Object>(
  filename: string | URL,
  workerOptions?: WorkerOptions
): Promise<SpawnPromiseObject<T> & { exit: Promise<number>; terminate: () => Promise<number> }> => {
  const worker = new Worker(filename, {
    execArgv: process.execArgv,
    ...(workerOptions || {})
  });

  let terminated = false;

  const deferred = getDeferred<number>();
  worker.on('exit', (code) => {
    if (code !== 0 && !terminated) {
      deferred.reject(new Error(`Worker stopped with exit code ${code}`) as any);
    } else {
      deferred.resolve(code);
    }
  });

  const functions = await new Promise<string[]>((resolve, reject) => {
    const resultListener = (msg: MsgListFunctions) => {
      if (msg.type !== 'list-functions') return;
      removeListeners();

      resolve(msg.functions);
    };

    const errListener = (err) => {
      removeListeners();
      reject(err);
    };

    const removeListeners = () => {
      worker.removeListener('message', resultListener);
      worker.removeListener('error', errListener);
    };

    worker.on('message', resultListener);
    worker.on('error', errListener);
  });

  const callFunction =
    (fnName: string) =>
    async (...fnArgs: any[]): Promise<any> => {
      return new Promise((resolve, reject) => {
        let resolved = false;
        const id = Math.random().toString(36).slice(2);

        const resultListener = (msg: MsgResult) => {
          if (resolved) return;
          if (msg.type !== 'result' || msg.id !== id) return;
          resolved = true;
          worker.removeListener('message', resultListener);
          worker.removeListener('error', errListener);
          resolve(msg.result);
        };

        const errListener = (err) => {
          if (resolved) return;
          worker.removeListener('message', resultListener);
          worker.removeListener('error', errListener);
          reject(err);
        };

        worker.on('message', resultListener);
        worker.on('error', errListener);

        worker.postMessage({ type: 'trigger', name: fnName, args: fnArgs, id } as MsgTrigger);
      });
    };

  const terminate = () => {
    terminated = true;
    worker.terminate();
    return deferred.promise;
  };

  const callObj = Object.fromEntries(functions.map((fnName) => [fnName, callFunction(fnName)])) as unknown as SpawnPromiseObject<T>;

  return {
    ...callObj,
    exit: deferred.promise,
    terminate
  };
};
