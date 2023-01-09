var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  expose: () => expose,
  exposeBidirectional: () => exposeBidirectional,
  primary: () => primary_exports,
  secondary: () => secondary_exports,
  spawn: () => spawn,
  spawnBidirectional: () => spawnBidirectional
});
module.exports = __toCommonJS(src_exports);

// src/sections/primary.ts
var primary_exports = {};
__export(primary_exports, {
  spawn: () => spawn,
  spawnBidirectional: () => spawnBidirectional
});
var import_node_worker_threads = require("worker_threads");
var import_msg_facade = __toESM(require("msg-facade"), 1);
var handleSpawn = async (filename, workerOptions, getFacade) => {
  const worker = new import_node_worker_threads.Worker(filename, {
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
  return handleSpawn(filename, workerOptions, (worker) => import_msg_facade.default.obtain(worker, import_msg_facade.default.configs.workers));
};
var spawnBidirectional = async (exposeObj, filename, workerOptions) => {
  return handleSpawn(
    filename,
    workerOptions,
    (worker) => import_msg_facade.default.bidirectional(exposeObj, worker, import_msg_facade.default.configs.workers)
  );
};

// src/sections/secondary.ts
var secondary_exports = {};
__export(secondary_exports, {
  expose: () => expose,
  exposeBidirectional: () => exposeBidirectional
});
var import_node_worker_threads2 = require("worker_threads");
var import_msg_facade2 = __toESM(require("msg-facade"), 1);
var expose = (obj) => {
  return import_msg_facade2.default.share(obj, import_node_worker_threads2.parentPort, import_msg_facade2.default.configs.workers);
};
var exposeBidirectional = async (obj) => {
  return import_msg_facade2.default.bidirectional(obj, import_node_worker_threads2.parentPort, import_msg_facade2.default.configs.workers);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expose,
  exposeBidirectional,
  primary,
  secondary,
  spawn,
  spawnBidirectional
});
