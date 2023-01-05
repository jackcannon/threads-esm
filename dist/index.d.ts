import { WorkerOptions, workerData } from 'node:worker_threads';
export { workerData } from 'node:worker_threads';

declare type UnWrapPromise<T> = T extends Promise<infer U> ? U : T;
declare type StripFunctions<T> = T extends (...args: any[]) => infer R ? R : T;
declare type ReplaceReturnType<T extends (...args: any) => any, Z> = (...args: Parameters<T>) => Z;
declare type Functionalise<T> = T extends (...args: any[]) => any ? T : () => T;
declare type SpawnPromiseObject<T> = {
    [K in keyof T]: ReplaceReturnType<Functionalise<T[K]>, Promise<UnWrapPromise<StripFunctions<T[K]>>>>;
};
declare type SpawnedWorker<T> = SpawnPromiseObject<T> & {
    exit: Promise<number>;
    terminate: () => Promise<number>;
};

declare const spawn: <T extends Object>(filename: string | URL, workerOptions?: WorkerOptions) => Promise<SpawnedWorker<T>>;

declare const primary_spawn: typeof spawn;
declare namespace primary {
  export {
    primary_spawn as spawn,
  };
}

declare const expose: <T extends Object>(obj: T) => void;

declare const secondary_workerData: typeof workerData;
declare const secondary_expose: typeof expose;
declare namespace secondary {
  export {
    secondary_workerData as workerData,
    secondary_expose as expose,
  };
}

export { SpawnPromiseObject, SpawnedWorker, expose, primary, secondary, spawn };
