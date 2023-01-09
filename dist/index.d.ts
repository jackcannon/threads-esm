import { WorkerOptions } from 'node:worker_threads';
import * as msg_facade from 'msg-facade';
import { MappedMsgFacade } from 'msg-facade';

type SpawnedWorker<T> = MappedMsgFacade<T> & {
    exit: Promise<number>;
    terminate: () => Promise<number>;
};

declare const spawn: <T extends Object>(filename: string | URL, workerOptions?: WorkerOptions) => Promise<SpawnedWorker<T>>;
declare const spawnBidirectional: <ParentT extends Object, WorkerT extends Object>(exposeObj: ParentT, filename: string | URL, workerOptions?: WorkerOptions) => Promise<MappedMsgFacade<WorkerT> & {
    exit: Promise<number>;
    terminate: () => Promise<number>;
}>;

declare const primary_spawn: typeof spawn;
declare const primary_spawnBidirectional: typeof spawnBidirectional;
declare namespace primary {
  export {
    primary_spawn as spawn,
    primary_spawnBidirectional as spawnBidirectional,
  };
}

declare const expose: <T extends Object>(obj: T) => Promise<{
    promise: Promise<any>;
}>;
declare const exposeBidirectional: <ParentT extends Object, WorkerT extends Object>(obj: ParentT) => Promise<msg_facade.MsgFacade<WorkerT>>;

declare const secondary_expose: typeof expose;
declare const secondary_exposeBidirectional: typeof exposeBidirectional;
declare namespace secondary {
  export {
    secondary_expose as expose,
    secondary_exposeBidirectional as exposeBidirectional,
  };
}

export { SpawnedWorker, expose, exposeBidirectional, primary, secondary, spawn, spawnBidirectional };
