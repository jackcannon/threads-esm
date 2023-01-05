var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/sections/primary.ts
var primary_exports = {};
__export(primary_exports, {
  spawn: () => spawn
});
import { Worker } from "node:worker_threads";
import { getDeferred } from "swiss-ak";
var spawn = async (filename, workerOptions) => {
  const worker = new Worker(filename, {
    execArgv: process.execArgv,
    ...workerOptions || {}
  });
  let terminated = false;
  const deferred = getDeferred();
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
  workerData: () => workerData
});
import { parentPort, workerData } from "node:worker_threads";
var expose = (obj) => {
  var _a, _b;
  const functions = Object.keys(obj);
  (_a = parentPort) == null ? void 0 : _a.postMessage({ type: "list-functions", functions });
  (_b = parentPort) == null ? void 0 : _b.on("message", async (msg) => {
    var _a2;
    if (msg.type !== "trigger")
      return;
    const value = obj[msg.name];
    if (!value)
      throw new Error(`Function ${msg.name} does not exist`);
    const result = typeof value === "function" ? value(...msg.args || []) : value;
    const awaited = await result;
    (_a2 = parentPort) == null ? void 0 : _a2.postMessage({ type: "result", id: msg.id, result: awaited });
  });
};
export {
  expose,
  primary_exports as primary,
  secondary_exports as secondary,
  spawn,
  workerData
};
