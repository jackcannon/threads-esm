import { Worker, WorkerOptions } from 'node:worker_threads';
import msgFacade, { MappedMsgFacade, MsgFacade } from 'msg-facade';
import { SpawnedWorker } from './types.js';

const handleSpawn = async <T>(filename: string | URL, workerOptions: WorkerOptions, getFacade: (worker: Worker) => Promise<MsgFacade<T>>) => {
  const worker = new Worker(filename, {
    execArgv: process.execArgv,
    ...(workerOptions || {})
  });

  let terminated = false;

  const facade = await getFacade(worker);
  const { promise, ...facadeRest } = facade;
  const callObj = facadeRest as unknown as MappedMsgFacade<T>;

  const exit = promise.then(
    (code: number) =>
      new Promise<number>((resolve, reject) => {
        if (code !== 0 && !terminated) {
          reject(new Error(`Worker stopped with exit code ${code}`) as any);
        } else {
          resolve(code);
        }
      })
  );

  const terminate = () => {
    terminated = true;
    worker.terminate();
    return promise;
  };

  return {
    ...callObj,
    exit,
    terminate
  };
};

export const spawn = <T extends Object>(filename: string | URL, workerOptions?: WorkerOptions): Promise<SpawnedWorker<T>> => {
  return handleSpawn<T>(filename, workerOptions, (worker) => msgFacade.obtain<T, typeof worker>(worker, msgFacade.configs.workers));
};

export const spawnBidirectional = async <ParentT extends Object, WorkerT extends Object>(
  exposeObj: ParentT,
  filename: string | URL,
  workerOptions?: WorkerOptions
) => {
  return handleSpawn<WorkerT>(filename, workerOptions, (worker) =>
    msgFacade.bidirectional<ParentT, WorkerT, typeof worker>(exposeObj, worker, msgFacade.configs.workers)
  );
};
