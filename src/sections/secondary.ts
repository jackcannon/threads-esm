import { parentPort, workerData } from 'node:worker_threads';
import msgFacade from 'msg-facade';

export const expose = <T extends Object>(obj: T) => {
  return msgFacade.share<T, typeof parentPort>(obj, parentPort, msgFacade.configs.workers);
};

export const exposeBidirectional = async <ParentT extends Object, WorkerT extends Object>(obj: ParentT) => {
  return msgFacade.bidirectional<ParentT, WorkerT, typeof parentPort>(obj, parentPort, msgFacade.configs.workers);
};
