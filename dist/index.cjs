var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  expose: () => expose,
  primary: () => primary_exports,
  secondary: () => secondary_exports,
  spawn: () => spawn,
  workerData: () => import_node_worker_threads2.workerData
});
module.exports = __toCommonJS(src_exports);

// src/sections/primary.ts
var primary_exports = {};
__export(primary_exports, {
  spawn: () => spawn
});
var import_node_worker_threads = require("worker_threads");
var import_swiss_ak = require("swiss-ak");
var spawn = async (filename, workerOptions) => {
  const worker = new import_node_worker_threads.Worker(filename, {
    execArgv: process.execArgv,
    ...workerOptions || {}
  });
  let terminated = false;
  const deferred = (0, import_swiss_ak.getDeferred)();
  worker.on("exit", (code) => {
    if (code !== 0 && !terminated) {
      deferred.reject(new Error(`Worker stopped with exit code ${code}`));
    } else {
      deferred.resolve(code);
    }
  });
  const functions = await new Promise((resolve, reject) => {
    const resultListener = (msg) => {
      if (msg.type !== "list-functions")
        return;
      removeListeners();
      resolve(msg.functions);
    };
    const errListener = (err) => {
      removeListeners();
      reject(err);
    };
    const removeListeners = () => {
      worker.removeListener("message", resultListener);
      worker.removeListener("error", errListener);
    };
    worker.on("message", resultListener);
    worker.on("error", errListener);
  });
  const callFunction = (fnName) => async (...fnArgs) => {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const id = Math.random().toString(36).slice(2);
      const resultListener = (msg) => {
        if (resolved)
          return;
        if (msg.type !== "result" || msg.id !== id)
          return;
        resolved = true;
        worker.removeListener("message", resultListener);
        worker.removeListener("error", errListener);
        resolve(msg.result);
      };
      const errListener = (err) => {
        if (resolved)
          return;
        worker.removeListener("message", resultListener);
        worker.removeListener("error", errListener);
        reject(err);
      };
      worker.on("message", resultListener);
      worker.on("error", errListener);
      worker.postMessage({ type: "trigger", name: fnName, args: fnArgs, id });
    });
  };
  const terminate = () => {
    terminated = true;
    worker.terminate();
    return deferred.promise;
  };
  const callObj = Object.fromEntries(functions.map((fnName) => [fnName, callFunction(fnName)]));
  return {
    ...callObj,
    exit: deferred.promise,
    terminate
  };
};

// src/sections/secondary.ts
var secondary_exports = {};
__export(secondary_exports, {
  expose: () => expose,
  workerData: () => import_node_worker_threads2.workerData
});
var import_node_worker_threads2 = require("worker_threads");
var expose = (obj) => {
  var _a, _b;
  const functions = Object.keys(obj);
  (_a = import_node_worker_threads2.parentPort) == null ? void 0 : _a.postMessage({ type: "list-functions", functions });
  (_b = import_node_worker_threads2.parentPort) == null ? void 0 : _b.on("message", async (msg) => {
    var _a2;
    if (msg.type !== "trigger")
      return;
    const value = obj[msg.name];
    if (!value)
      throw new Error(`Function ${msg.name} does not exist`);
    const result = typeof value === "function" ? value(...msg.args || []) : value;
    const awaited = await result;
    (_a2 = import_node_worker_threads2.parentPort) == null ? void 0 : _a2.postMessage({ type: "result", id: msg.id, result: awaited });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expose,
  primary,
  secondary,
  spawn,
  workerData
});
