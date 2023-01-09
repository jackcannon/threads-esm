var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/sections/primary.ts
var primary_exports = {};
__export(primary_exports, {
  spawn: () => spawn,
  spawnBidirectional: () => spawnBidirectional
});
import { Worker } from "node:worker_threads";
import msgFacade from "msg-facade";
var handleSpawn = async (filename, workerOptions, getFacade) => {
  const worker = new Worker(filename, {
    execArgv: process.execArgv,
    ...workerOptions || {}
  });
  let terminated = false;
  const facade = await getFacade(worker);
  const { promise, ...facadeRest } = facade;
  const callObj = facadeRest;
  const exit = promise.then(
    (code) => new Promise((resolve, reject) => {
      if (code !== 0 && !terminated) {
        reject(new Error(`Worker stopped with exit code ${code}`));
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
var spawn = (filename, workerOptions) => {
  return handleSpawn(filename, workerOptions, (worker) => msgFacade.obtain(worker, msgFacade.configs.workers));
};
var spawnBidirectional = async (exposeObj, filename, workerOptions) => {
  return handleSpawn(
    filename,
    workerOptions,
    (worker) => msgFacade.bidirectional(exposeObj, worker, msgFacade.configs.workers)
  );
};

// src/sections/secondary.ts
var secondary_exports = {};
__export(secondary_exports, {
  expose: () => expose,
  exposeBidirectional: () => exposeBidirectional
});
import { parentPort } from "node:worker_threads";
import msgFacade2 from "msg-facade";
var expose = (obj) => {
  return msgFacade2.share(obj, parentPort, msgFacade2.configs.workers);
};
var exposeBidirectional = async (obj) => {
  return msgFacade2.bidirectional(obj, parentPort, msgFacade2.configs.workers);
};
export {
  expose,
  exposeBidirectional,
  primary_exports as primary,
  secondary_exports as secondary,
  spawn,
  spawnBidirectional
};
