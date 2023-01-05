import { parentPort, workerData } from 'node:worker_threads';
import { MsgResult, MsgTrigger } from './types.js';

export { workerData };

export const expose = <T extends Object>(obj: T) => {
  const functions = Object.keys(obj);
  parentPort?.postMessage({ type: 'list-functions', functions });

  parentPort?.on('message', async (msg: MsgTrigger) => {
    if (msg.type !== 'trigger') return;

    const value = obj[msg.name];
    if (!value) throw new Error(`Function ${msg.name} does not exist`);

    const result = typeof value === 'function' ? value(...(msg.args || [])) : value;
    const awaited = await result;

    parentPort?.postMessage({ type: 'result', id: msg.id, result: awaited } as MsgResult);
  });
};
